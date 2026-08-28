function Footer() {
  return (
    <footer className="border-t border-white/10 py-10 px-6">

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">

        <div>
          <h2 className="text-2xl font-bold text-cyan-400">
            HireSense AI
          </h2>

          <p className="text-gray-500 mt-2">
            Production-grade AI Interview Copilot Platform
          </p>
        </div>

        <div className="flex gap-6 text-gray-400 text-sm">
          <button className="hover:text-cyan-400 transition">
            Features
          </button>

          <button className="hover:text-cyan-400 transition">
            Dashboard
          </button>

          <button className="hover:text-cyan-400 transition">
            Contact
          </button>
        </div>

      </div>
    </footer>
  );
}

export default Footer;