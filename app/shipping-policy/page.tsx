export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Shipping Policy</h1>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <p>
                At ZuhaSurgical, we are committed to delivering your medical equipment orders safely and efficiently.
                Please review our shipping policy below for detailed information about our delivery process.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delivery Areas</h2>
              <p>We currently provide delivery services to the following areas:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All major cities across Pakistan</li>
                <li>Rural areas (subject to courier service availability)</li>
                <li>International shipping available on request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Costs</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">🎉 Free Shipping Offer</h3>
                <p className="text-green-700">
                  <strong>Free delivery on orders over PKR 10,000!</strong> For orders below this amount, standard
                  delivery charges of PKR 200 apply.
                </p>
              </div>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Delivery: PKR 200 (3-5 business days)</li>
                <li>Express Delivery: PKR 400 (1-2 business days)</li>
                <li>Same Day Delivery: PKR 600 (available in major cities)</li>
                <li>International Shipping: Calculated based on destination and weight</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Processing Time</h2>
              <p>
                Orders are typically processed within 1-2 business days after payment confirmation. During peak seasons
                or for specialized equipment, processing may take up to 3-5 business days.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Standard items: 1-2 business days</li>
                <li>Custom or specialized equipment: 3-7 business days</li>
                <li>Bulk orders: 5-10 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delivery Methods</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Standard Delivery</h3>
                  <p className="text-gray-600">
                    Delivered through our trusted courier partners. Tracking information provided via SMS and email.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Express Delivery</h3>
                  <p className="text-gray-600">
                    Priority handling and faster delivery for urgent medical equipment needs.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Special Handling</h2>
              <p>
                Medical equipment requires special care during shipping. We ensure all products are properly packaged
                and handled according to medical device shipping standards.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Temperature-sensitive items shipped with appropriate cooling</li>
                <li>Fragile equipment packed with extra protective materials</li>
                <li>Sterile items maintained in sterile packaging</li>
                <li>Heavy equipment delivered with installation support (if applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Order Tracking</h2>
              <p>
                Once your order is shipped, you will receive a tracking number via email and SMS. You can track your
                order status through:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Our website order tracking system</li>
                <li>Courier partner's tracking portal</li>
                <li>SMS updates at key delivery milestones</li>
                <li>Customer service hotline: +92 321 5702979</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Delivery Confirmation</h2>
              <p>
                For security and verification purposes, we require signature confirmation for all deliveries. If you're
                not available to receive the package:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Courier will attempt delivery up to 3 times</li>
                <li>Package will be held at the nearest courier facility</li>
                <li>You'll be notified to arrange pickup or reschedule delivery</li>
                <li>Packages held for more than 7 days will be returned to us</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Damaged or Lost Packages</h2>
              <p>
                In the rare event that your package arrives damaged or goes missing during transit, please contact us
                immediately:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Report damaged packages within 24 hours of delivery</li>
                <li>Provide photos of damaged packaging and contents</li>
                <li>We will arrange for replacement or full refund</li>
                <li>Lost packages are covered by our shipping insurance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Shipping</h2>
              <p>
                We offer international shipping for medical equipment with proper documentation and compliance with
                destination country regulations.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Additional documentation may be required</li>
                <li>Customs duties and taxes are buyer's responsibility</li>
                <li>Delivery times vary by destination (5-15 business days)</li>
                <li>Some items may be restricted for international shipping</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p>
                For any shipping-related questions or concerns, please don't hesitate to contact our customer service
                team:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p>
                      <strong>Email:</strong> zuhasurgical@gmail.com
                    </p>
                    <p>
                      <strong>Phone:</strong> +92 321 5702979
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM
                    </p>
                    <p>
                      <strong>Emergency:</strong> +92 321 5702979
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
