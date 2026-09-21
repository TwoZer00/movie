export const CastSkeleton = () => (
  <div className='flex flex-col'>
    <div className='rounded-xl overflow-hidden border border-black/8 dark:border-white/8 aspect-square animate-shimmer'></div>
    <div className='h-3 animate-shimmer rounded-full mt-2 w-3/4 mx-auto'></div>
  </div>
);

export const PosterSkeleton = () => (
  <div className='aspect-[2/3] w-24 sm:w-32 animate-shimmer rounded-xl'></div>
);
