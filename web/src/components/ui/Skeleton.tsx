export const Skeleton = ({
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className='mt-6 flex flex-col gap-3' {...props}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex items-center gap-3 animate-pulse'>
          <div className='h-8 w-8 rounded-lg bg-zinc-700/60 border-2 border-zinc-800' />
          <div className='h-5 w-44 rounded bg-zinc-700/60' />
          <div className='ml-auto h-4 w-4 rounded bg-zinc-700/60' />
        </div>
      ))}
    </div>
  )
}
