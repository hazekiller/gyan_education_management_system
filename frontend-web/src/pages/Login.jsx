import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Sparkles, BookOpen, Users } from 'lucide-react';
import { login, selectAuthLoading, selectAuthError } from '../store/slices/authSlice';
import toast from 'react-hot-toast';
import gsap from 'gsap';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  // Refs for GSAP animations
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const cardRef = useRef(null);
  const formRef = useRef(null);
  const floatingIconsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logo animation
      gsap.from(logoRef.current, {
        scale: 0,
        rotation: 360,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
      });

      // Title animation
      gsap.from(titleRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: 'power3.out',
      });

      // Card animation
      gsap.from(cardRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: 'power3.out',
      });

      // Form elements stagger animation
      gsap.from('.form-element', {
        x: -50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.8,
        ease: 'power2.out',
      });

      // Floating icons animation
      floatingIconsRef.current.forEach((icon, index) => {
        gsap.to(icon, {
          y: '+=20',
          duration: 2 + index * 0.5,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.2,
        });
      });

      // Continuous subtle rotation for logo
      gsap.to(logoRef.current, {
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    // Button click animation
    gsap.to(e.target, {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    });

    try {
      const result = await dispatch(login(formData)).unwrap();

      // Success animation
      gsap.to(cardRef.current, {
        scale: 1.05,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          toast.success('Login successful!');
          navigate('/dashboard');
        }
      });
    } catch (err) {
      // Error shake animation
      gsap.to(cardRef.current, {
        x: [-10, 10, -10, 10, 0],
        duration: 0.5,
        ease: 'power2.out',
      });
      toast.error(err || 'Login failed');
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <BookOpen
          ref={el => floatingIconsRef.current[0] = el}
          className="absolute top-20 left-1/4 w-8 h-8 text-blue-300 opacity-30"
        />
        <Users
          ref={el => floatingIconsRef.current[1] = el}
          className="absolute top-1/3 right-1/4 w-10 h-10 text-purple-300 opacity-30"
        />
        <Sparkles
          ref={el => floatingIconsRef.current[2] = el}
          className="absolute bottom-1/4 left-1/3 w-6 h-6 text-pink-300 opacity-30"
        />
        <GraduationCap
          ref={el => floatingIconsRef.current[3] = el}
          className="absolute bottom-1/3 right-1/3 w-12 h-12 text-indigo-300 opacity-30"
        />
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Login Card */}
        <div
          ref={cardRef}
          className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white/50 relative overflow-hidden"
        >
          {/* Card shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none"></div>

          {/* Logo inside card */}
          <div className="text-center mb-8 relative z-10">
            <div
              ref={logoRef}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl mb-4 border-4 border-white relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white opacity-20"></div>
              <GraduationCap className="w-12 h-12 text-white relative z-10" />
            </div>

            <div ref={titleRef}>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 tracking-tight">
                Gyan
              </h1>
              <p className="text-gray-600 text-sm font-medium mb-6">School Management System</p>
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Please sign in to continue</p>
          </div>

          {error && (
            <div className="form-element mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Email Input */}
            <div className="form-element">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-700 bg-white/50 backdrop-blur-sm hover:bg-white"
                  placeholder="your.email@gyan.edu"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-element">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors duration-200" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-700 bg-white/50 backdrop-blur-sm hover:bg-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-element">
              <button
                type="submit"
                disabled={loading}
                className="relative z-20 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                {loading ? (
                  <span className="flex items-center justify-center relative z-10">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  <span className="relative z-10">Sign In</span>
                )}
              </button>
            </div>
          </form>

          {/* Forgot Password Link */}
          <div className="form-element mt-6 text-center relative z-10">
            <a href="#" className="text-sm text-blue-600 hover:text-purple-600 font-medium hover:underline transition-colors duration-200 inline-flex items-center gap-1">
              Forgot your password?
              <Sparkles className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-700 text-sm flex items-center justify-center gap-2 font-medium">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Powered by <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quantum Tech</span>
          </p>
          <p className="text-gray-600 text-xs mt-2">
            © 2025 Gyan Education Management System. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;