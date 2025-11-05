// import { motion } from 'framer-motion'
// import { useInView } from 'framer-motion'
// import { useRef } from 'react'

// const AnimatedOutfitSection = () => {
//   const ref = useRef(null)
//   const isInView = useInView(ref, { once: true, amount: 0.3 })

//   // Animation variants for each part
//   const shirtVariants = {
//     hidden: { y: -200, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.8,
//         delay: 0.2,
//         ease: [0.6, 0.05, 0.01, 0.9]
//       }
//     }
//   }

//   const shortsVariants = {
//     hidden: { y: 200, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.8,
//         delay: 0.5,
//         ease: [0.6, 0.05, 0.01, 0.9]
//       }
//     }
//   }

//   const slippersVariants = {
//     hidden: { y: 100, opacity: 0, scale: 0.8 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       scale: 1,
//       transition: {
//         duration: 1,
//         delay: 0.8,
//         type: "spring",
//         stiffness: 200,
//         damping: 15
//       }
//     }
//   }

//   return (
//     <section 
//       ref={ref}
//       className="relative py-12 md:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden"
//     >
//       {/* Background decorative elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <motion.div
//           initial={{ opacity: 0, scale: 0 }}
//           animate={isInView ? { opacity: 0.05, scale: 1 } : {}}
//           transition={{ duration: 1.5 }}
//           className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-500 rounded-full blur-3xl"
//         />
//         <motion.div
//           initial={{ opacity: 0, scale: 0 }}
//           animate={isInView ? { opacity: 0.05, scale: 1 } : {}}
//           transition={{ duration: 1.5, delay: 0.3 }}
//           className="absolute -bottom-20 -left-20 w-96 h-96 bg-black rounded-full blur-3xl"
//         />
//       </div>

//       <div className="container mx-auto px-4 relative z-10">
//         {/* Section Title */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.8 }}
//           className="text-center mb-12 md:mb-16"
//         >
//           <motion.h2 
//             className="text-3xl md:text-5xl font-bold text-gray-900 mb-4"
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={isInView ? { opacity: 1, scale: 1 } : {}}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             Complete Your Look
//           </motion.h2>
//           <motion.p 
//             className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
//             initial={{ opacity: 0 }}
//             animate={isInView ? { opacity: 1 } : {}}
//             transition={{ duration: 0.8, delay: 0.4 }}
//           >
//             Style from head to toe with SnP Brand
//           </motion.p>
//         </motion.div>

//         {/* Animated Outfit Container */}
//         <div className="flex justify-center items-center">
//           <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg h-[500px] md:h-[600px] lg:h-[700px]">
            
//             {/* Shirt - Top Part (0% to 40% height) */}
//             <motion.div
//               variants={shirtVariants}
//               initial="hidden"
//               animate={isInView ? "visible" : "hidden"}
//               className="absolute inset-0 w-full h-full"
//               style={{
//                 clipPath: 'polygon(0% 0%, 100% 0%, 100% 40%, 0% 40%)',
//                 zIndex: 3
//               }}
//             >
//               <img
//                 src="/images/Outfit.jpeg"
//                 alt="Complete Outfit - Shirt"
//                 className="w-full h-full object-cover object-center"
//                 loading="lazy"
//               />
//               {/* Overlay label */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={isInView ? { opacity: 1 } : {}}
//                 transition={{ delay: 1.2, duration: 0.5 }}
//                 className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs md:text-sm font-medium"
//               >
//                 Premium Apparel
//               </motion.div>
//             </motion.div>

//             {/* Shorts - Middle Part (40% to 70% height) */}
//             <motion.div
//               variants={shortsVariants}
//               initial="hidden"
//               animate={isInView ? "visible" : "hidden"}
//               className="absolute inset-0 w-full h-full"
//               style={{
//                 clipPath: 'polygon(0% 40%, 100% 40%, 100% 70%, 0% 70%)',
//                 zIndex: 2
//               }}
//             >
//               <img
//                 src="/images/Outfit.jpeg"
//                 alt="Complete Outfit - Shorts"
//                 className="w-full h-full object-cover object-center"
//                 loading="lazy"
//               />
//               {/* Overlay label */}
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={isInView ? { opacity: 1 } : {}}
//                 transition={{ delay: 1.5, duration: 0.5 }}
//                 className="absolute top-1/2 left-4 -translate-y-1/2 bg-yellow-500/90 text-black px-3 py-1 rounded-full text-xs md:text-sm font-medium"
//               >
//                 Stylish Comfort
//               </motion.div>
//             </motion.div>

//             {/* Slippers - Bottom Part (70% to 100% height) */}
//             <motion.div
//               variants={slippersVariants}
//               initial="hidden"
//               animate={isInView ? "visible" : "hidden"}
//               className="absolute inset-0 w-full h-full"
//               style={{
//                 clipPath: 'polygon(0% 70%, 100% 70%, 100% 100%, 0% 100%)',
//                 zIndex: 1
//               }}
//             >
//               <img
//                 src="/images/Outfit.jpeg"
//                 alt="Complete Outfit - Slippers"
//                 className="w-full h-full object-cover object-center"
//                 loading="lazy"
//               />
//               {/* Overlay label */}
//               <motion.div
//                 initial={{ opacity: 0, scale: 0.8 }}
//                 animate={isInView ? { opacity: 1, scale: 1 } : {}}
//                 transition={{ delay: 1.8, duration: 0.5, type: "spring" }}
//                 className="absolute bottom-4 left-4 bg-white/90 text-black px-3 py-1 rounded-full text-xs md:text-sm font-medium shadow-lg"
//               >
//                 Signature Slippers
//               </motion.div>
//             </motion.div>

//             {/* Shimmer effect on hover */}
//             <motion.div
//               className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
//               initial={{ x: '-100%', opacity: 0 }}
//               animate={isInView ? { x: '200%', opacity: [0, 1, 0] } : {}}
//               transition={{ delay: 2.5, duration: 1.5, ease: "easeInOut" }}
//               style={{ pointerEvents: 'none' }}
//             />
//           </div>
//         </div>

//         {/* Call to Action */}
//         <motion.div
//           initial={{ opacity: 0, y: 30 }}
//           animate={isInView ? { opacity: 1, y: 0 } : {}}
//           transition={{ duration: 0.8, delay: 2 }}
//           className="text-center mt-12 md:mt-16"
//         >
//           <motion.button
//             whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
//             whileTap={{ scale: 0.95 }}
//             className="bg-black text-white px-8 py-4 rounded-full font-semibold text-base md:text-lg shadow-lg hover:bg-gray-900 transition-colors duration-300"
//             onClick={() => window.location.href = '/shop'}
//           >
//             Shop The Collection
//           </motion.button>
//         </motion.div>
//       </div>
//     </section>
//   )
// }

// export default AnimatedOutfitSection

