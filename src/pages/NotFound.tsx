import Wordmark from "@/components/brand/Wordmark";
import { ArrowLeftOutlined, CompassOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="cc-grid" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="cc-orb cc-animate-float-a left-1/4 top-1/4 h-72 w-72 bg-brand-400/10"
      />
      <div
        aria-hidden="true"
        className="cc-orb cc-animate-float-b bottom-1/4 right-1/4 h-64 w-64 bg-brand-300/6"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative text-center"
      >
        <Link to="/" className="inline-block">
          <Wordmark size="md" />
        </Link>

        <p className="cc-display mt-10 leading-none">
          <span className="cc-gradient-text">404</span>
        </p>

        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          This page took a wrong turn
        </h1>

        <p className="cc-lede mx-auto mt-3 max-w-md">
          We could not find{" "}
          <code className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[0.8em] text-brand-700">
            {location.pathname}
          </code>
          . It may have moved, or the link that brought you here may be out of
          date.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to="/" className="cc-btn cc-btn-primary cc-btn--lg">
            <ArrowLeftOutlined />
            Back to home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="cc-btn cc-btn-secondary cc-btn--lg"
          >
            <CompassOutlined />
            Go back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
