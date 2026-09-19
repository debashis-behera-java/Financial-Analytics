import Box from '@mui/material/Box';

/**
 * Layered atmospheric background: large blurred radial glows plus soft
 * translucent wave ribbons across the upper viewport. Fixed,
 * non-interactive, and behind all content — decorative only.
 */
export function AmbientBackground() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Wave ribbons */}
      <Box
        sx={{
          position: 'absolute',
          top: '-220px',
          left: '-10%',
          width: '120%',
          height: 480,
          borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)',
          filter: 'blur(30px)',
          transform: 'rotate(-4deg)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: '-140px',
          left: '20%',
          width: '90%',
          height: 340,
          borderRadius: '50%',
          background: 'linear-gradient(180deg, rgba(125,92,255,0.12) 0%, rgba(125,92,255,0) 100%)',
          filter: 'blur(40px)',
          transform: 'rotate(3deg)',
        }}
      />
      {/* Upper-left blue glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 640,
          height: 640,
          left: '-180px',
          top: '-180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74, 144, 255, 0.28) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
      />
      {/* Upper-right purple glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 680,
          height: 680,
          right: '-220px',
          top: '-120px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(125, 92, 255, 0.26) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Center cyan/blue glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 760,
          height: 520,
          left: '22%',
          top: '32%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(56, 189, 248, 0.14) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
      />
      {/* Lower-left lavender glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 620,
          height: 620,
          left: '-200px',
          bottom: '-240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167, 139, 250, 0.22) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />
      {/* Lower-right blue glow */}
      <Box
        sx={{
          position: 'absolute',
          width: 660,
          height: 660,
          right: '-220px',
          bottom: '-260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />
    </Box>
  );
}
