const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4">
    <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
  </div>
);

export default PageLoader;
