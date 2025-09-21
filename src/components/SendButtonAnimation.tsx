'use client'

import React, { useRef, useEffect } from 'react'

interface SendButtonAnimationProps {
  onSend: () => void
  disabled?: boolean
}

const SendButtonAnimation: React.FC<SendButtonAnimationProps> = ({ onSend, disabled = false }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const ranOnceRef = useRef(false)

  useEffect(() => {
    const initAnimation = async () => {
      try {
        const gsap = (await import('gsap')).default
        const { MotionPathPlugin } = await import('gsap/MotionPathPlugin')
        const { MorphSVGPlugin } = await import('gsap/MorphSVGPlugin')
        
        gsap.registerPlugin(MotionPathPlugin, MorphSVGPlugin)
        
        // Convert paths for morphing
        MorphSVGPlugin.convertToPath("circle, rect")
        
        // Set initial states exactly like CodePen
        gsap.set("#paperPlaneRoute", { drawSVG: "0% 0%" })
        gsap.set("#rectSentItems", { x: "-=240" })

        const handleBtnUp = () => {
          if (disabled) {
            console.log('Button is disabled - not submitting')
            return
          }
          
          if (ranOnceRef.current) {
            return
          }
          ranOnceRef.current = true

          const tl = gsap.timeline()
          
          // Trigger send function after 2 second delay to see animation
          setTimeout(() => {
            onSend()
          }, 2000)

          tl.to("#base", { duration: 0.2, scale: 1, transformOrigin: "50% 50%" })
          tl.to("#btnBase", { duration: 0.77, morphSVG: "#cBottom", ease: "power1.inOut" }, "start")
          tl.to("#btnBase", { duration: 0.23, morphSVG: "#cTop", ease: "power1.inOut" })
          tl.to("#btnBase", { duration: 0.2, morphSVG: "#cCenter", ease: "power1.inOut" })
          tl.to("#btnBase", { duration: 0.5, morphSVG: "#cEnd", ease: "power1.inOut" }, "revealStart")
          
          tl.to("#rectSentItems", { x: "0", duration: 0.5 }, "revealStart")
          tl.to("#mask1", { x: "-=260", duration: 0.5, ease: "power1.inOut" }, "revealStart")
          tl.to("#paperPlane", { x: "-=205", duration: 0.5, ease: "power1.inOut" }, "revealStart")
          tl.to("#paperPlanePath", { duration: 0.43, morphSVG: "#tickMark" }, "start+=0.77")
          
          tl.to("#txtSend", { duration: 0.6, scale: 0, transformOrigin: "50% 50%" }, "start")
          tl.to("#paperPlaneRoute", { drawSVG: "80% 100%", duration: 0.7, ease: "power1.inOut" }, "start+=0.3")
          tl.to("#paperPlaneRoute", { drawSVG: "100% 100%", duration: 0.2, ease: "power1.inOut" }, "start+=1")
          
          tl.to("#paperPlane", {
            duration: 1,
            ease: "power1.inOut",
            immediateRender: true,
            motionPath: {
              path: "#paperPlaneRoute",
              align: "#paperPlaneRoute",
              alignOrigin: [0.5, 0.5],
              autoRotate: 90
            }
          }, "start")
          
          // Keep plane purple throughout animation - no color changes
        }

        const handleBtnDown = () => {
          gsap.to("#base", { duration: 0.1, scale: 0.9, transformOrigin: "50% 50%" })
        }

        const handleMouseEnter = () => {
          const btnBase = svgRef.current?.querySelector("#btnBase")
          const txtSend = svgRef.current?.querySelector("#txtSend")
          if (btnBase && txtSend) {
            btnBase.setAttribute("stroke", "rgba(168, 85, 247, 1)")
            btnBase.setAttribute("stroke-width", "2")
            btnBase.setAttribute("filter", "drop-shadow(0 0 25px rgba(168, 85, 247, 0.6))")
            txtSend.setAttribute("fill", "#ffffff")
          }
        }

        const handleMouseLeave = () => {
          const btnBase = svgRef.current?.querySelector("#btnBase")
          const txtSend = svgRef.current?.querySelector("#txtSend")
          if (btnBase && txtSend) {
            btnBase.setAttribute("stroke", "rgba(255, 214, 102, 0.6)")
            btnBase.setAttribute("stroke-width", "1")
            btnBase.setAttribute("filter", "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))")
            txtSend.setAttribute("fill", "#f8fafc")
          }
        }

        // Add event listeners
        const btn = svgRef.current?.querySelector("#base")
        if (btn) {
          btn.addEventListener("mousedown", handleBtnDown)
          btn.addEventListener("mouseup", handleBtnUp)
          btn.addEventListener("mouseenter", handleMouseEnter)
          btn.addEventListener("mouseleave", handleMouseLeave)
        }

        return () => {
          if (btn) {
            btn.removeEventListener("mousedown", handleBtnDown)
            btn.removeEventListener("mouseup", handleBtnUp)
            btn.removeEventListener("mouseenter", handleMouseEnter)
            btn.removeEventListener("mouseleave", handleMouseLeave)
          }
        }
      } catch (error) {
        console.error('Failed to load GSAP:', error)
      }
    }

    initAnimation()
  }, [onSend])

  return (
    <div className="send-button-container" data-disabled={disabled.toString()}>
      <svg 
        ref={svgRef}
        className="send-button-svg"
        viewBox="350 400 700 300" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <path 
          id="paperPlaneRoute" 
          d="M563.558,526.618 C638.854,410.19 787.84,243.065 916.53,334.949 1041.712,424.328 858.791,877.927 743.926,856.655 642.241,838.669 699.637,688.664 700,540" 
          stroke="rgba(255, 255, 255, 0.3)" 
          strokeWidth="3" 
          style={{ strokeDashoffset: '0.001px', strokeDasharray: '0px, 999999px' }}
        />
        
        <g id="rectSent" clipPath="url(#clipPath)">
          <g id="rectSentItems">
            <rect id="sentBase" x="460" y="468.5" width="480" height="143" rx="23" fill="rgba(255, 255, 255, 0.15)"/>
            <text id="txtSent" fill="rgba(255, 214, 102, 1)" xmlSpace="preserve" style={{ whiteSpace: 'pre', fontFamily: 'Sora, ui-sans-serif, system-ui, sans-serif', fontWeight: '700', letterSpacing: '0.05em', textRendering: 'optimizeLegibility' }} fontSize="82">
              <tspan x="637.487" y="568.027">Sent!</tspan>
            </text>
          </g>
        </g>
        
        <g id="base">
          <rect id="btnBase" x="418.117" y="460.55" width="563.765" height="158.899" rx="27" className="btn-base" />
          <text id="txtSend" className="btn-text-send" xmlSpace="preserve" style={{ whiteSpace: 'pre', fontFamily: 'Sora, ui-sans-serif, system-ui, sans-serif', fontWeight: '700', letterSpacing: '0.05em', textRendering: 'optimizeLegibility' }} fontSize="82">
            <tspan x="679.379" y="568.027">Send</tspan>
          </text>
          
          <g id="paperPlane" style={{ transformOrigin: '0px 0px 0px' }} transform="translate(0, 15)">
            <path 
              id="paperPlanePath" 
              d="M560.611 481.384C562.003 479.263 565.113 479.263 566.505 481.384L607.063 543.177C615.657 556.272 607.507 573.375 592.766 575.676L566.422 557.462V510.018C566.422 508.436 565.14 507.154 563.558 507.154C561.976 507.154 560.693 508.436 560.693 510.018V557.462L534.349 575.676C519.609 573.375 511.459 556.272 520.053 543.177L560.611 481.384Z" 
              className="paper-plane-path"
            />
          </g>
        </g>
        
        <circle id="cBottom" cx="700" cy="540" r="97.516" fill="rgba(255, 214, 102, 0.3)" className="hidden"/>
        <circle id="cTop" cx="700" cy="502.365" r="107.898" fill="rgba(255, 214, 102, 0.3)" className="hidden"/>
        <circle id="cCenter" cx="700" cy="540" r="123" fill="rgba(255, 214, 102, 0.4)" className="hidden"/>
        <circle id="cEnd" cx="495" cy="540" r="98" fill="rgba(255, 255, 255, 0.15)" className="hidden"/>
        
        <path 
          id="tickMark" 
          fillRule="evenodd" 
          clipRule="evenodd" 
          d="M597.3 489.026C595.179 487.257 592.026 487.541 590.257 489.662L550.954 536.768L534.647 522.965C532.539 521.181 529.384 521.444 527.6 523.551L519.096 533.598C517.312 535.706 517.575 538.861 519.682 540.645L538.606 556.662C538.893 557.162 539.272 557.621 539.74 558.012L549.847 566.445C551.967 568.214 555.12 567.929 556.889 565.809L608.042 504.501C609.811 502.38 609.527 499.227 607.406 497.458L597.3 489.026Z" 
          fill="rgba(255, 214, 102, 0.9)" 
          className="hidden"
        />
        
        <defs>
          <clipPath id="clipPath">
            <rect id="mask1" x="700" y="450" width="520" height="180" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}

export default SendButtonAnimation
