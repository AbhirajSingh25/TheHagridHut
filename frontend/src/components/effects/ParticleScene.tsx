import { useEffect, useRef } from "react";

type Point3D = {
  x: number;
  y: number;
  z: number;
};

type DustParticle = {
  x: number;
  y: number;
  size: number;
  speed: number;
};

export default function ParticleScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    let animationFrame = 0;

    let width = 0;
    let height = 0;

    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      2,
    );

    const resize = () => {
      const rect = canvas.getBoundingClientRect();

      width = rect.width;
      height = rect.height;

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;

      ctx.setTransform(
        pixelRatio,
        0,
        0,
        pixelRatio,
        0,
        0,
      );
    };

    resize();

    window.addEventListener(
      "resize",
      resize,
    );

    /*
     * Fibonacci sphere.
     * This gives us a reasonably even distribution
     * of points without needing Three.js.
     */
    const points: Point3D[] = [];

    const pointCount = 220;

    for (
      let i = 0;
      i < pointCount;
      i++
    ) {
      const phi = Math.acos(
        1 -
          (2 * (i + 0.5)) /
            pointCount,
      );

      const theta =
        Math.PI *
        (1 + Math.sqrt(5)) *
        i;

      points.push({
        x:
          Math.sin(phi) *
          Math.cos(theta),

        y:
          Math.sin(phi) *
          Math.sin(theta),

        z: Math.cos(phi),
      });
    }

    const dust: DustParticle[] =
      Array.from(
        { length: 80 },
        () => ({
          x: Math.random(),
          y: Math.random(),
          size:
            Math.random() * 1.2 +
            0.3,
          speed:
            Math.random() *
              0.00012 +
            0.00003,
        }),
      );

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (
      event: MouseEvent,
    ) => {
      mouseX =
        (event.clientX /
          window.innerWidth -
          0.5) *
        0.7;

      mouseY =
        (event.clientY /
          window.innerHeight -
          0.5) *
        0.7;
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove,
    );

    let time = 0;

    const draw = () => {
      time += 0.0025;

      ctx.clearRect(
        0,
        0,
        width,
        height,
      );

      /*
       * Background particles
       */
      for (const particle of dust) {
        particle.y -= particle.speed;

        if (particle.y < 0) {
          particle.y = 1;
        }

        ctx.beginPath();

        ctx.arc(
          particle.x * width,
          particle.y * height,
          particle.size,
          0,
          Math.PI * 2,
        );

        ctx.fillStyle =
          "rgba(180,190,255,0.26)";

        ctx.fill();
      }

      const centerX =
        width * 0.5;

      const centerY =
        height * 0.5;

      const radius =
        Math.min(
          width,
          height,
        ) * 0.29;

      const rotateY =
        time + mouseX;

      const rotateX =
        time * 0.55 + mouseY;

      const projected =
        points.map(
          (point) => {
            let {
              x,
              y,
              z,
            } = point;

            /*
             * Y rotation
             */
            const rotatedX =
              x *
                Math.cos(
                  rotateY,
                ) -
              z *
                Math.sin(
                  rotateY,
                );

            let rotatedZ =
              x *
                Math.sin(
                  rotateY,
                ) +
              z *
                Math.cos(
                  rotateY,
                );

            /*
             * X rotation
             */
            const rotatedY =
              y *
                Math.cos(
                  rotateX,
                ) -
              rotatedZ *
                Math.sin(
                  rotateX,
                );

            rotatedZ =
              y *
                Math.sin(
                  rotateX,
                ) +
              rotatedZ *
                Math.cos(
                  rotateX,
                );

            const perspective =
              1 /
              (2.7 -
                rotatedZ);

            return {
              x:
                centerX +
                rotatedX *
                  radius *
                  perspective *
                  2.2,

              y:
                centerY +
                rotatedY *
                  radius *
                  perspective *
                  2.2,

              depth:
                rotatedZ,
            };
          },
        );

      /*
       * Neural connections
       */
      for (
        let i = 0;
        i <
        projected.length;
        i++
      ) {
        for (
          let j = i + 1;
          j <
          projected.length;
          j++
        ) {
          const a =
            projected[i];

          const b =
            projected[j];

          if (!a || !b) {
            continue;
          }

          const dx =
            a.x - b.x;

          const dy =
            a.y - b.y;

          const distance =
            Math.hypot(
              dx,
              dy,
            );

          const maxDistance =
            radius * 0.27;

          if (
            distance <
            maxDistance
          ) {
            const depth =
              (a.depth +
                b.depth) /
              2;

            const opacity =
              Math.max(
                0,
                (1 -
                  distance /
                    maxDistance) *
                  0.13 *
                  (depth + 1.2),
              );

            ctx.beginPath();

            ctx.moveTo(
              a.x,
              a.y,
            );

            ctx.lineTo(
              b.x,
              b.y,
            );

            ctx.strokeStyle =
              `rgba(155,124,255,${opacity})`;

            ctx.lineWidth =
              0.5;

            ctx.stroke();
          }
        }
      }

      /*
       * Sphere nodes
       */
      for (
        const point of projected
      ) {
        const depth =
          (point.depth + 1) /
          2;

        ctx.beginPath();

        ctx.arc(
          point.x,
          point.y,
          0.65 +
            depth * 1.4,
          0,
          Math.PI * 2,
        );

        if (
          depth > 0.63
        ) {
          ctx.fillStyle =
            `rgba(103,232,249,${0.2 + depth * 0.6})`;
        } else {
          ctx.fillStyle =
            `rgba(167,139,250,${0.12 + depth * 0.42})`;
        }

        ctx.fill();
      }

      animationFrame =
        requestAnimationFrame(
          draw,
        );
    };

    draw();

    return () => {
      cancelAnimationFrame(
        animationFrame,
      );

      window.removeEventListener(
        "resize",
        resize,
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove,
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
    />
  );
}