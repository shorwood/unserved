import { join } from 'node:path'
import { mkdir, readdir, rename, rm } from 'node:fs/promises'
import { execute } from '@unshared/process'
import { ModuleSteam } from '../index'

export interface DownloadWorkshopItemOptions {
  appid: string
  publishedfileid: string
  outputDirectory?: string
  onProgress?: (size: number) => void
}

/**
 * Downloads a workshop item from the Steam Workshop using the `steamcmd` utility.
 *
 * @param options The options to use to download the Workshop item.
 * @returns
 * An event emitter that emits the size of the downloaded item every second. It can
 * be awaited to get the output directory of the downloaded item.
 */
export async function downloadWorkshopItem(this: ModuleSteam, options: DownloadWorkshopItemOptions): Promise<void> {
  const { appid, publishedfileid, outputDirectory, onProgress } = options
  const { steamcmdPath, steamcmdUsername, steamcmdPassword } = this

  // --- Remove the `/Steam/steamapps/workshop` directory if it exists. This mitigates
  // --- the CWorkThreadPool errors that occur when downloading Workshop items.
  // --- https://epochmod.com/forum/topic/42074-fixed-steamcmd-queue-not-empty/
  const workshopPath = join(steamcmdPath, 'steamapps/workshop')
  await rm(workshopPath, { recursive: true, force: true })

  // --- Create the output directory of steamcmd so we can monitor the download progress.
  const workshopDownloadPath = join(steamcmdPath, 'steamapps/workshop/downloads', options.appid, options.publishedfileid)
  const workshopOutputPath = join(steamcmdPath, 'steamapps/workshop/content', options.appid, options.publishedfileid)
  await mkdir(workshopDownloadPath, { recursive: true })

  // --- Download the workshop item.
  const steamcmdSh = join(steamcmdPath, 'steamcmd.sh')
  const downloadProcess = execute(steamcmdSh, [
    '+login',
    steamcmdUsername,
    steamcmdPassword,
    '+workshop_download_item',
    appid,
    publishedfileid,
    'validate',
    '+quit',
  ])

  // --- Check the folder every seconds and emit the size of the downloaded item.
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const interval = onProgress && setInterval(async() => {
    const output = await execute('du', ['-sb', workshopDownloadPath], 'utf8').catch(() => {})
    if (output === undefined) { clearInterval(interval); return }
    const size = Number.parseInt(output)
    onProgress(size)
  }, 100)

  // --- If no `outputDirectory` is provided then return the path to the downloaded item.
  await downloadProcess
  clearInterval(interval)
  const exists = await readdir(workshopOutputPath).then(x => x.length > 0).catch(() => false)
  if (!exists) throw new Error('An error occurred while downloading the Workshop item.')
  if (!outputDirectory) return

  // --- Steamcmd does not provide a way to specify the output directory so we need to move it manually.
  // --- Compute the path to the downloaded item and move it to the output directory.
  await mkdir(outputDirectory, { recursive: true })
  await rename(workshopOutputPath, outputDirectory)
}
