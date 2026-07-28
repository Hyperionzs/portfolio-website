import React from 'react';
import { TypeAnimation } from 'react-type-animation';
import { motion } from 'framer-motion';
import project4 from '../assets/projects/project4.jpeg';
import { useProfilePhoto } from '../hooks/useProfilePhoto';
import { AuroraBackground } from './AuroraBackground';


export function Hero() {
  const { profilePhoto } = useProfilePhoto();
  const heroImage = profilePhoto || project4;

  const textVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.3,
        duration: 0.6,
        ease: "easeOut"
      }
    }),
  };
  
  const floatAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut"
    }
  };

  return (
    <AuroraBackground>
      <section
        id="hero"
        className="min-h-screen w-full flex flex-col items-center justify-center text-center relative text-white overflow-hidden"
      >
        {/* Background gradient overlay with subtle animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 z-[1]"
          animate={{
            background: [
              "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.8))",
              "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent, rgba(0,0,0,0.8))",
              "linear-gradient(to bottom, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.8))"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container mx-auto px-4 py-20 relative z-[2] flex flex-col items-center">
        <motion.img
          src={heroImage}
          alt="Foto Profil"
          className="w-36 h-36 md:w-44 md:h-44 rounded-full border-4 border-purple-500 shadow-lg mb-6 object-cover"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: "0 0 25px rgba(124, 58, 237, 0.6)",
            borderColor: "#a855f7"
          }}
        />

        <motion.h1
          className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent leading-tight text-center"
          variants={textVariant}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          Hello, I'm Anggra
        </motion.h1>

        <motion.div
          className="mt-4 text-lg md:text-xl font-extrabold max-w-xl text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text"
          variants={textVariant}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <TypeAnimation
            sequence={[
              'Frontend Developer',
              2000,
              'Information Technology Student',
              2000,
              'Lifelong Learner',
              2000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
          />
        </motion.div>

        <motion.a
          href="#projects"
          className="mt-8 inline-block px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 transition text-white shadow-lg backdrop-blur-md relative overflow-hidden group"
          variants={textVariant}
          initial="hidden"
          animate="visible"
          custom={3}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 20px rgba(147, 51, 234, 0.7)",
          }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative z-10">My Projects</span>
        </motion.a>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-[2]"
        animate={floatAnimation}
      >
        <div className="flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity">
          <span className="text-xs mb-1">Scroll Down</span>
          <motion.div 
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 17L12 7M12 17L8 13M12 17L16 13" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>
    </section>
    </AuroraBackground>
  );
}


