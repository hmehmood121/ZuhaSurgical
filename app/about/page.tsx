export default function About() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-fade-in">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About ZuhaSurgical</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your trusted partner for premium medical and surgical equipment. Quality you can trust, service you can
              rely on.
            </p>
          </div>

          {/* Company Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="animate-slide-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="prose prose-lg text-gray-700 space-y-4">
                <p>
                  Founded with a mission to provide healthcare professionals with the highest quality medical equipment,
                  ZuhaSurgical has been serving the medical community for years. We understand that in healthcare, there
                  is no room for compromise when it comes to quality and reliability.
                </p>
                <p>
                  Our journey began with a simple vision: to bridge the gap between healthcare providers and premium
                  medical equipment manufacturers. Today, we are proud to be a trusted name in the medical equipment
                  industry, serving hospitals, clinics, and healthcare professionals across the region.
                </p>
                <p>
                  Every product in our catalog is carefully selected and tested to meet the highest standards of quality
                  and safety. We believe that by providing superior equipment, we contribute to better patient outcomes
                  and support healthcare professionals in their noble mission.
                </p>
              </div>
            </div>

            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="bg-green-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-green-800 mb-6">Why Choose Us?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Premium Quality</h4>
                      <p className="text-gray-600">All products are sourced from certified manufacturers</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Expert Support</h4>
                      <p className="text-gray-600">Our team provides technical guidance and after-sales support</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Fast Delivery</h4>
                      <p className="text-gray-600">Quick and secure delivery to your location</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Competitive Pricing</h4>
                      <p className="text-gray-600">Best prices without compromising on quality</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-gray-50 rounded-2xl p-8 animate-slide-up">
              <div className="text-center mb-6">
                <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-700 text-center">
                To empower healthcare professionals with premium medical equipment that enhances patient care and
                improves health outcomes. We are committed to providing reliable, innovative, and cost-effective
                solutions to the medical community.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-center mb-6">
                <div className="bg-green-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-700 text-center">
                To be the leading provider of medical equipment in the region, recognized for our commitment to quality,
                innovation, and customer satisfaction. We envision a future where every healthcare facility has access
                to world-class medical equipment.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Commitment</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="animate-slide-up">
                <div className="bg-blue-50 rounded-2xl p-6">
                  <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Quality Assurance</h3>
                  <p className="text-gray-600">
                    Every product undergoes rigorous quality checks to ensure it meets international standards.
                  </p>
                </div>
              </div>

              <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
                <div className="bg-purple-50 rounded-2xl p-6">
                  <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Service</h3>
                  <p className="text-gray-600">
                    Our dedicated support team is always ready to assist you with your medical equipment needs.
                  </p>
                </div>
              </div>

              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="bg-green-50 rounded-2xl p-6">
                  <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Innovation</h3>
                  <p className="text-gray-600">
                    We continuously update our inventory with the latest medical technologies and innovations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="bg-green-600 rounded-2xl p-8 text-center text-white animate-slide-up">
            <h2 className="text-3xl font-bold mb-4">Ready to Partner with Us?</h2>
            <p className="text-xl mb-6 opacity-90">
              Contact us today to discuss your medical equipment needs and discover how we can support your healthcare
              facility.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-green-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Contact Us
              </a>
              <a
                href="tel:+15551234567"
                className="bg-green-700 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-800 transition-colors"
              >
                Call Now: +92 321 5702979
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
