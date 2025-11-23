import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, BookOpen } from 'lucide-react';

export default function HomeFooter() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'About Us', link: '#' },
    { name: 'Admissions', link: '#' },
    { name: 'Faculty', link: '#' },
    { name: 'Careers', link: '#' },
    { name: 'News & Events', link: '#' },
    { name: 'Contact Us', link: '#' }
  ];

  const resources = [
    { name: 'Student Portal', link: '#' },
    { name: 'Parent Portal', link: '#' },
    { name: 'Library', link: '#' },
    { name: 'E-Learning', link: '#' },
    { name: 'Academic Calendar', link: '#' },
    { name: 'Downloads', link: '#' }
  ];

  const policies = [
    { name: 'Privacy Policy', link: '#' },
    { name: 'Terms of Service', link: '#' },
    { name: 'Cookie Policy', link: '#' },
    { name: 'Refund Policy', link: '#' }
  ];

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <h3 className="text-white text-xl font-bold">EduManage</h3>
            </div>
            <p className="text-sm leading-relaxed">
              Empowering education through innovative school management solutions. 
              Building a better future, one student at a time.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-blue-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.link} 
                    className="text-sm hover:text-blue-500 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <a 
                    href={resource.link} 
                    className="text-sm hover:text-blue-500 transition-colors hover:translate-x-1 inline-block"
                  >
                    {resource.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">123 Education Street, Academic City, ST 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-500 flex-shrink-0" />
                <span className="text-sm">info@edumanage.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-white text-lg font-semibold mb-2">Subscribe to Our Newsletter</h4>
            <p className="text-sm mb-4">Stay updated with the latest news and announcements</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-blue-500 text-white text-sm"
              />
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} EduManage. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {policies.map((policy, index) => (
                <span key={policy.name} className="flex items-center">
                  <a 
                    href={policy.link} 
                    className="text-sm text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {policy.name}
                  </a>
                  {index < policies.length - 1 && (
                    <span className="ml-4 text-gray-600">|</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

