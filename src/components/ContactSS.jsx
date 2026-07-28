import React from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaWhatsapp, FaInstagram, FaGithub } from 'react-icons/fa';

export function Contact() {
  return (
    <motion.section
      id="contact"
      className="relative z-[1] py-24 px-6 bg-gray-950 text-white overflow-hidden"
      style={{ scrollMarginTop: '80px', paddingTop: '120px' }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      {/* Background Glow & Grid Pattern to match About Me */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-10 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:40px_40px] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)]" />

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,rgba(0,0,0,0.03)_1px)] [background-size:40px_40px] opacity-40" />

        {/* Floating Background Elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-cyan-300/10 to-blue-300/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-48 w-96 h-96 bg-gradient-to-tr from-purple-300/5 to-pink-300/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-80 h-80 bg-gradient-to-tr from-green-300/5 to-emerald-300/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6 text-cyan-400 drop-shadow-neon">Get in Touch</h2>
        <p className="text-gray-300 mb-12 text-lg">
          I'm open to collaboration, feedback, or just a good conversation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <motion.a
            href="mailto:anggratr56@email.com"
            className="relative z-[1] bg-[#111] p-6 rounded-2xl shadow-lg hover:shadow-cyan-500/50 transition hover:scale-105 flex items-center space-x-4 border border-cyan-500/20"
            whileHover={{ scale: 1.03 }}
            title="Send an email to anggratr56@email.com"
          >
            <FaEnvelope className="text-4xl text-cyan-400 drop-shadow-neon" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-cyan-300">Email</h3>
              <p className="text-gray-400">anggratr56@email.com</p>
            </div>
          </motion.a>

          <motion.a
            href="https://wa.me/6283155811515"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-[1] bg-[#111] p-6 rounded-2xl shadow-lg hover:shadow-green-400/50 transition hover:scale-105 flex items-center space-x-4 border border-green-500/20"
            whileHover={{ scale: 1.03 }}
          >
            <FaWhatsapp className="text-4xl text-green-400 drop-shadow-neon" />
            <div className="text-left">
              <h3 className="text-lg font-semibold text-green-300">WhatsApp</h3>
              <p className="text-gray-400">083155811515</p>
            </div>
          </motion.a>

          <motion.a
            href="https://www.instagram.com/anggra___12"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-[1] bg-[#111] p-6 rounded-2xl shadow-lg hover:shadow-purple-400/50 transition hover:scale-105 flex items-center space-x-4 border border-purple-500/20"
            whileHover={{ scale: 1.03 }}
          >
            <FaInstagram className="text-4xl text-purple-500 drop-shadow-neon" />
            <div className="text-left">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Instagram
              </h3>
              <p className="text-gray-400">@Anggra___12</p>
            </div>
          </motion.a>

          <motion.a
            href="https://www.github.com/hyperionzs"
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-[1] bg-[#111] p-6 rounded-2xl shadow-lg hover:shadow-gray-400/50 transition hover:scale-105 flex items-center space-x-4 border border-gray-500/20"
            whileHover={{ scale: 1.03 }}
          >
            <FaGithub className="text-4xl text-brown-500 drop-shadow-neon" />
            <div className="text-left">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Github
              </h3>
              <p className="text-gray-400">@Hyperionzs</p>
            </div>
          </motion.a>
        </div>
      </div>
    </motion.section>
  );
}
