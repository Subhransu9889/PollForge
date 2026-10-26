import { useState } from 'react'
import { QrCode, Download, LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function PollQrDialog({ pollId, title }: { pollId: string; title: string }) {
  const [open, setOpen] = useState(false)
  const [image, setImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const url = `${window.location.origin}/p/${pollId}`
  const generate = async () => {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const QRCode = await import('qrcode')
      setImage(await QRCode.toDataURL(url, { width: 1024, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#000000', light: '#ffffff' } }))
    } catch {
      setError('The QR code could not be generated. Try again or use the poll link below.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <Button variant="outline" onClick={() => { setOpen(true); if (!image) void generate() }}><QrCode className="size-4" />Share QR code</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="pr-8">Scan to open this poll</DialogTitle><DialogDescription>{title}</DialogDescription></DialogHeader>
          <div className="qr-preview">
            {image ? <img src={image} width={256} height={256} alt={`QR code linking to ${title}`} /> : <div role="status">{loading ? <><LoaderCircle className="size-6 animate-spin" />Generating QR code…</> : 'QR preview unavailable'}</div>}
          </div>
          {error && <div role="alert" className="text-sm text-destructive">{error}<Button variant="outline" onClick={generate} disabled={loading}>Try again</Button></div>}
          <a href={url} target="_blank" rel="noreferrer" className="break-all text-xs text-primary underline">{url}</a>
          <p className="text-xs text-muted">Anyone with this code can open the poll. Its sign-in and expiration rules still apply.</p>
          {image && <a className="qr-download" download={`pollforge-${pollId}-qr.png`} href={image}><Download className="size-4" />Download QR image</a>}
        </DialogContent>
      </Dialog>
    </>
  )
}
