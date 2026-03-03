export const CastSkeleton = () => {
  return (
    <div className='flex flex-col animate-pulse'>
      <div className='rounded-lg overflow-hidden shadow-md border-2 border-gray-200 dark:border-gray-700 aspect-square bg-gray-300 dark:bg-gray-600'></div>
      <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded mt-2 w-3/4 mx-auto'></div>
    </div>
  );
};

export const PosterSkeleton = () => {
  return (
    <div className='aspect-[2/3] w-24 sm:w-32 bg-gray-300 dark:bg-gray-600 animate-pulse rounded'></div>
  );
};
