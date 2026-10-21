import Image from 'next/image'

interface Props {
  url: string
  keyword: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 48,
  md: 80,
  lg: 120,
}

export function Pictograma({ url, keyword, size = 'md' }: Props) {
  const dimension = sizes[size]
  
  return (
    <figure className="flex flex-col items-center gap-2">
      <Image
        src={url}
        alt={keyword}
        width={dimension}
        height={dimension}
        className="rounded-lg"
      />
      <figcaption className="text-sm text-court-600 text-center">
        {keyword}
      </figcaption>
    </figure>
  )
}
