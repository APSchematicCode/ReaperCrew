// lib/email.ts

export async function sendOrderStatusEmail(
  customerEmail: string,
  customerName: string,
  orderId: string,
  status: string,
  items: any[],
  totalCents: number
) {
  const brevoKey = process.env.BREVO_API_KEY
  if (!brevoKey) {
    console.warn('⚠️ BREVO_API_KEY is not set – skipping email')
    return
  }

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td>${item.name} (${item.variant})</td>
      <td>× ${item.quantity}</td>
      <td>$${(item.price / 100).toFixed(2)}</td>
    </tr>
  `
    )
    .join('')

  const totalDollars = (totalCents / 100).toFixed(2)
  const statusEmoji = status === 'completed' ? '✅' : status === 'shipped' ? '📦' : status === 'cancelled' ? '❌' : '📝'
  const statusMessage =
    status === 'pending'
      ? 'Your order has been received and is pending review.'
      : status === 'paid'
      ? 'Your payment has been confirmed. We are preparing your order.'
      : status === 'shipped'
      ? 'Your order has been shipped!'
      : status === 'completed'
      ? 'Your order has been delivered. Enjoy!'
      : status === 'cancelled'
      ? 'Your order has been cancelled.'
      : 'Your order status has been updated.'

  const htmlContent = `
    <h1>Order Status Update, ${customerName}!</h1>
    <p>${statusEmoji} Your order <strong>#${orderId.slice(0, 8)}</strong> is now <strong>${status.toUpperCase()}</strong>.</p>
    <p>${statusMessage}</p>
    <h3>Order Summary</h3>
    <table border="1" cellpadding="5">
      <tr><th>Item</th><th>Qty</th><th>Price</th></tr>
      ${itemsHtml}
      <tr><td colspan="2"><strong>Total</strong></td><td><strong>$${totalDollars}</strong></td></tr>
    </table>
    <p>– Reaper Crew</p>
  `

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoKey,
      },
      body: JSON.stringify({
        sender: { email: 'lasvegassc702@yahoo.com', name: 'Reaper Crew' }, // Update this to noreply@reapercrew.com later
        to: [{ email: customerEmail, name: customerName }],
        subject: `Order #${orderId.slice(0, 8)} Status: ${status.toUpperCase()}`,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Brevo email failed:', errorText)
    } else {
      console.log(`✅ Status email sent to ${customerEmail} (Status: ${status})`)
    }
  } catch (err: any) {
    console.error('❌ Brevo error:', err.message)
  }
}