export default function Footer() {
  return (
    <footer className="bg-brand text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <ul className="space-y-2">
            <li>Shipping Policy</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Payment Policy</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Information</h4>
          <ul className="space-y-2">
            <li>Exchange & Refund</li>
            <li>Size Guide</li>
            <li>Store Locations</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2">
            <li>About Us</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Service Center</h4>
          <ul className="space-y-2">
            <li>+880 9666-774577</li>
            <li>support@urbana.example</li>
          </ul>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-700">
        © 2026 URBANA. Demo storefront — all product data is placeholder content.
      </div>
    </footer>
  );
}
