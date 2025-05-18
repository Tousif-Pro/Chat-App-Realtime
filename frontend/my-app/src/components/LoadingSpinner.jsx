const LoadingSpinner = () => {
  return (
    <div className="inline-block h-8 w-8 animate-[spin_1s_linear_infinite]">
      <div className="h-full w-full rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent"></div>
    </div>
  );
};

export default LoadingSpinner; 