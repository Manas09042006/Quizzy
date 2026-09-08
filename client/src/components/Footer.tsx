
import { Link } from "react-router-dom";
import { Github, Linkedin, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white">
      
      {/* Gradient Top Border */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="max-w-7xl mx-auto px-6 py-7">
        
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">

          {/* Logo & Tagline */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
              <Sparkles size={18} />
            </div>

            <div>
              <h3 className="text-xl font-bold tracking-tight">
                Quizzy
              </h3>

              <p className="text-xs text-slate-400">
                Create. Challenge. Conquer.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-5 text-sm">
            <Link
              to="/"
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              Home
            </Link>

            <Link
              to="/create"
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              Create
            </Link>

            <Link
              to="/explore"
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              Explore
            </Link>
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-2">

            {/* GitHub */}
            <a
              href="https://github.com/vedant4375/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-indigo-500 hover:text-white hover:border-indigo-400 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Github size={18} />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/vedant-garje-291956356/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 border border-white/10 hover:bg-purple-500 hover:text-white hover:border-purple-400 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Linkedin size={18} />
            </a>

          </div>
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-white/10" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-slate-300 font-medium">Quizzy</span>.
            All rights reserved.
          </p>

          <p>
            Made with <span className="text-pink-400">♥</span> by{" "}
            <span className="text-indigo-400 font-medium">Veduu</span>
          </p>
        </div>

      </div>
    </footer>
  );
}

