import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full fixed top-0 z-50 backdrop-blur-lg bg-white/5 border-b border-cyan-500/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          to="/"
          className="text-2xl font-bold text-cyan-400 tracking-wide"
        >
          HireSense AI
        </Link>

        <div className="flex items-center gap-6 text-sm text-gray-300">

          <a
            href="#features"
            className="hover:text-cyan-400 transition"
          >
            Features
          </a>

          <Link
            to="/dashboard"
            className="hover:text-cyan-400 transition"
          >
            Dashboard
          </Link>

          <Link
            to="/login"
            className="hover:text-cyan-400 transition"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="
              px-5 py-2 rounded-xl
              bg-cyan-500 hover:bg-cyan-400
              transition
              text-black font-semibold
            "
          >
            Get Started
          </Link>

        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;