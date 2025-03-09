import React, { useEffect, useRef } from "react";

// Matter.js 類型定義
type MatterType = typeof import("matter-js");
interface Ball extends Matter.Body {
  fadeState: "fadingIn" | "normal" | "fadingOut";
  fadeProgress: number;
}

const BubbleTeaBackground: React.FC = () => {
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 確保在瀏覽器環境中執行
    if (typeof window === "undefined") return;

    // 動態導入 Matter.js
    const loadMatter = async () => {
      const Matter = (await import("matter-js")) as MatterType;

      let render: Matter.Render;
      let engine: Matter.Engine;
      let runner: Matter.Runner;
      let intervalId: NodeJS.Timeout;
      let activeBalls: Ball[] = [];

      function createWorld() {
        if (intervalId) {
          clearInterval(intervalId);
        }

        const {
          Engine,
          Render,
          World,
          Bodies,
          Runner,
          Composite,
          Body,
          Events,
        } = Matter;

        if (engine) {
          World.clear(engine.world);
          Engine.clear(engine);
        }

        if (render) {
          Render.stop(render);
          if (render.canvas) {
            render.canvas.remove();
          }
          render.canvas = null as any;
          render.context = null as any;
          render.textures = {};
        }

        if (runner) {
          Runner.stop(runner);
        }

        if (!canvasContainerRef.current) return;

        const width = canvasContainerRef.current.clientWidth;
        const height = canvasContainerRef.current.clientHeight;

        engine = Engine.create();
        engine.world.gravity.y = 0.2;

        render = Render.create({
          element: canvasContainerRef.current,
          engine: engine,
          options: {
            width: width,
            height: height,
            wireframes: false,
            background: "#ebcfb4", // 與header背景色相同
            pixelRatio: window.devicePixelRatio,
          },
        });

        const walls = [
          Bodies.rectangle(width / 2, -10, width, 20, {
            isStatic: true,
            render: { visible: false },
            restitution: 1,
          }),
          Bodies.rectangle(width / 2, height + 10, width, 20, {
            isStatic: true,
            render: { visible: false },
            restitution: 1,
          }),
          Bodies.rectangle(-10, height / 2, 20, height, {
            isStatic: true,
            render: { visible: false },
            restitution: 1,
          }),
          Bodies.rectangle(width + 10, height / 2, 20, height, {
            isStatic: true,
            render: { visible: false },
            restitution: 1,
          }),
        ];

        Composite.add(engine.world, walls);
        activeBalls = [];

        function createBall(
          x?: number,
          y?: number,
          fadeIn: boolean = false,
        ): Ball {
          // 珍珠顏色變化
          const pearlColors = [
            "#e5bd99",
            "#e7c4a4",
            "#c59f84",
            "#bd8761",
            "#e5bd99",
            "#e7c4a4",
            "#c59f84",
            "#bd8761",
            "#e5bd99",
            "#e7c4a4",
            "#c59f84",
            "#bd8761",
            "#926341",
            "#926341",
            "#FFFFFF22",
          ];

          // 隨機生成大小
          const ballRadius = Math.random() * 50 + 10;

          // 如果沒有提供座標，則隨機生成
          x = x || Math.random() * (width - 2 * ballRadius) + ballRadius;
          y = y || Math.random() * (height - 2 * ballRadius) + ballRadius;

          const ball = Bodies.circle(x, y, ballRadius, {
            restitution: 1,
            friction: 0,
            frictionAir: 0,
            render: {
              fillStyle:
                pearlColors[Math.floor(Math.random() * pearlColors.length)],
              opacity: fadeIn ? 0 : 1,
            },
          }) as Ball;

          ball.angle = Math.random() * Math.PI * 2;
          ball.fadeState = fadeIn ? "fadingIn" : "normal";
          ball.fadeProgress = fadeIn ? 0 : 1;

          // 根據球的大小調整角速度（較大的球轉得慢一點）
          const angularVelocity =
            (Math.random() - 0.5) * 0.2 * (35 / ballRadius);
          Body.setAngularVelocity(ball, angularVelocity);

          // 根據球的大小調整速度（較大的球動得慢一點）
          const speedMultiplier = 35 / ballRadius;
          Body.setVelocity(ball, {
            x: (Math.random() - 0.5) * 10 * speedMultiplier,
            y: (Math.random() - 0.5) * 10 * speedMultiplier,
          });

          return ball;
        }

        function removeBall() {
          if (activeBalls.length === 0) return;

          const indexToRemove = Math.floor(Math.random() * activeBalls.length);
          const ballToRemove = activeBalls[indexToRemove];
          ballToRemove.fadeState = "fadingOut";
          ballToRemove.fadeProgress = 1;

          setTimeout(() => {
            Composite.remove(engine.world, ballToRemove);
            activeBalls = activeBalls.filter((b) => b !== ballToRemove);
          }, 1000);
        }

        // 初始生成珍珠
        for (let i = 0; i < 15; i++) {
          const ball = createBall();
          activeBalls.push(ball);
          Composite.add(engine.world, ball);
        }

        // 每隔一段時間添加新珍珠
        intervalId = setInterval(() => {
          if (activeBalls.length >= 25) {
            // 增加最大珍珠數量
            removeBall();
          }
          const newBall = createBall(undefined, undefined, true);
          activeBalls.push(newBall);
          Composite.add(engine.world, newBall);
        }, 2000);

        // 點擊時添加新珍珠
        if (render.canvas) {
          render.canvas.addEventListener("click", (event) => {
            if (!render.canvas) return;

            const rect = render.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            // 在點擊位置添加1顆新珍珠，一次點擊多個效果更明顯
            for (let i = 0; i < 1; i++) {
              // 在點擊位置周圍一小範圍內隨機生成珍珠，讓效果更自然
              const offsetX = (Math.random() - 0.5) * 40;
              const offsetY = (Math.random() - 0.5) * 40;

              const newBall = createBall(x + offsetX, y + offsetY, true);
              activeBalls.push(newBall);
              Composite.add(engine.world, newBall);

              // 如果超過最大數量，移除一些舊珍珠
              if (activeBalls.length > 20) {
                removeBall();
              }
            }
          });
        }

        // 淡入淡出效果
        Events.on(render, "beforeRender", () => {
          activeBalls.forEach((ball) => {
            if (ball.fadeState === "fadingIn") {
              ball.fadeProgress = Math.min(1, ball.fadeProgress + 0.05);
              if (ball.fadeProgress >= 1) {
                ball.fadeState = "normal";
              }
            } else if (ball.fadeState === "fadingOut") {
              ball.fadeProgress = Math.max(0, ball.fadeProgress - 0.05);
            }
            if (ball.render) {
              ball.render.opacity = ball.fadeProgress;
            }
          });
        });

        // 簡化渲染，純色珍珠
        Events.on(render, "afterRender", () => {
          const context = render.context;
          if (!context) return;

          activeBalls.forEach((ball) => {
            const pos = ball.position;
            const radius = (ball as any).circleRadius;
            const opacity = ball.fadeProgress;

            context.save();
            context.translate(pos.x, pos.y);
            context.globalAlpha = opacity;

            // 基本珍珠形狀
            context.beginPath();
            context.arc(0, 0, radius, 0, Math.PI * 2);
            context.fillStyle = ball.render
              ? (ball.render.fillStyle as string)
              : "#271511";
            context.fill();

            context.restore();
          });
        });

        Render.run(render);
        runner = Runner.create();
        Runner.run(runner, engine);
      }

      // 創建初始世界
      createWorld();

      // 處理視窗大小變化
      let resizeTimeout: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          createWorld();
        }, 250);
      };

      window.addEventListener("resize", handleResize);

      // 組件卸載時清理
      return () => {
        clearInterval(intervalId);
        window.removeEventListener("resize", handleResize);

        if (render) {
          Render.stop(render);
          if (render.canvas) {
            render.canvas.remove();
          }
        }

        if (runner) {
          Runner.stop(runner);
        }

        if (engine) {
          World.clear(engine.world);
          Engine.clear(engine);
        }
      };
    };

    loadMatter();
  }, []);

  return (
    <div
      ref={canvasContainerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        overflow: "hidden",
      }}
    />
  );
};

export default BubbleTeaBackground;
