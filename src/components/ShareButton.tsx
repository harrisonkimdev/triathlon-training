'use client'

import { Button } from '@/components/ui/button'

export function ShareButton() {
  async function handleShare() {
    const html2canvas = (await import('html2canvas')).default
    const card = document.getElementById('share-card')
    if (!card) return

    const canvas = await html2canvas(card, { scale: 2 })
    canvas.toBlob(async (blob) => {
      if (!blob) return

      const file = new File([blob], 'triathlon-result.png', { type: 'image/png' })

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'My Triathlon Score',
          files: [file],
        })
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'triathlon-result.png'
        a.click()
        URL.revokeObjectURL(url)
      }
    }, 'image/png')
  }

  return (
    <Button onClick={handleShare} className="w-full h-12 text-base font-semibold">
      Share Result 📤
    </Button>
  )
}
