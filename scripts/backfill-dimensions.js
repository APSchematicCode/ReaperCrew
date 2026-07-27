const { createClient } = require('@supabase/supabase-js')
const probe = require('probe-image-size')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

// ✅ Use Service Role Key (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env.local')
  console.log('   Add this line to your .env.local:')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  process.exit(1)
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getImageDimensions(url) {
  try {
    const result = await probe(url)
    return { width: result.width, height: result.height }
  } catch (err) {
    console.warn(`   ⚠️  Probe failed: ${err.message}`)
    return null
  }
}

async function backfillSlides() {
  console.log('📸 Backfilling slides...')
  
  const { data: slides, error } = await supabase
    .from('slides')
    .select('id, image_url, width, height')
    .or('width.is.null,width.eq.0')

  if (error) {
    console.error('❌ Failed to fetch slides:', error)
    return
  }

  console.log(`   Found ${slides?.length || 0} slides needing dimensions.`)
  if (!slides || slides.length === 0) return

  for (const slide of slides) {
    console.log(`   Processing slide ${slide.id}...`)
    const dims = await getImageDimensions(slide.image_url)
    if (dims) {
      const { error: updateError } = await supabase
        .from('slides')
        .update({ width: dims.width, height: dims.height })
        .eq('id', slide.id)

      if (updateError) {
        console.error(`      ❌ Update failed:`, updateError)
      } else {
        console.log(`      ✅ Updated: ${dims.width}×${dims.height}`)
      }
    } else {
      console.log(`      ❌ Could not fetch dimensions.`)
    }
  }
}

async function backfillProducts() {
  console.log('\n📦 Backfilling products...')
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, images_json, image_metadata')
    .or('image_metadata.is.null,image_metadata.eq.{}')

  if (error) {
    console.error('❌ Failed to fetch products:', error)
    return
  }

  console.log(`   Found ${products?.length || 0} products needing metadata.`)
  if (!products || products.length === 0) return

  for (const product of products) {
    const images = product.images_json || []
    if (images.length === 0) {
      console.log(`   ⏭️  Product ${product.id} has no images.`)
      continue
    }

    console.log(`   Processing product ${product.id} (${images.length} images)...`)
    const metadata = {}

    for (const url of images) {
      const dims = await getImageDimensions(url)
      if (dims) {
        metadata[url] = dims
        console.log(`      ✅ ${dims.width}×${dims.height}`)
      } else {
        console.log(`      ❌ Failed for ${url.substring(0, 50)}...`)
      }
    }

    if (Object.keys(metadata).length > 0) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_metadata: metadata })
        .eq('id', product.id)

      if (updateError) {
        console.error(`   ❌ Update failed:`, updateError)
      } else {
        console.log(`   ✅ Product ${product.id} updated (${Object.keys(metadata).length} images).`)
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting backfill with Service Role Key...\n')
  await backfillSlides()
  await backfillProducts()
  console.log('\n✅ Backfill complete!')
}

main().catch(console.error)