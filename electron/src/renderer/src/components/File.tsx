import { useEffect, useState } from 'react'

interface File {
  name: string
  isDir: boolean
}

const Item = ({
  handleClick,
  file
}: {
  handleClick: (fileName: string) => void
  file: File
}): JSX.Element => (
  <div
    key={file.name}
    className={file.isDir ? 'dir' : 'file'}
    onClick={() => {
      if (!file.isDir) return
      handleClick(file.name)
    }}
  >
    {file.isDir ? '📁' : '📄'}
    {file.name}
    {file.isDir ? '/' : ''}
  </div>
)

const FileBrowser = (): JSX.Element => {
  const [files, setFiles] = useState<File[]>([])
  const [currentPath, setCurrentPath] = useState<string>('')
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    async function getHomeDir() {
      const homeDirPath = await window.electron.getHomeDir()
      setCurrentPath(homeDirPath)
    }

    getHomeDir()
  }, [])

  useEffect(() => {
    async function getFiles() {
      if (!currentPath) return
      try {
        const contents = await window.electron.readDir(currentPath)

        const entries = [{ name: '.', isDir: true }, { name: '..', isDir: true }, ...contents]

        setFiles(entries)
      } catch (err) {
        console.error('Error reading directory:', err)
      }
    }
    getFiles()
  }, [currentPath])

  useEffect(() => {
    async function fetchImages() {
      if (!currentPath) return
      try {
        const contents = await window.electron.readDir(currentPath)

        const imageFiles = contents.filter((file: any) => /\.(jpg|jpeg|png|gif)$/i.test(file.name))
        const imagePaths = await Promise.all(
          imageFiles.map(async (file: any) => {
            const imagePath = await window.electron.resolvePath(currentPath, file.name)
            // Use custom protocol handler for file URLs
            return `file://${imagePath}`
          })
        )

        setImages(imagePaths)
      } catch (error) {
        console.error('Error fetching images:', error)
      }
    }

    fetchImages()
  }, [currentPath])

  async function handleClick(name: string) {
    const newPath = await window.electron.resolvePath(currentPath, name)
    setCurrentPath(newPath)
  }

  return (
    <div className="files">
      <div className="dirname">Files in {currentPath}</div>
      <div className="filelist">
        {files.map((file: File) => (
          <Item handleClick={handleClick} file={file} key={file.name} />
        ))}
      </div>
      <div className="images">
        <div className="bg-gradient-to-b from-black to-gray-800 w-full text-white md:h-screen text-center md:text-left">
          <div className="max-w-screen-lg p-4 mx-auto flex flex-col justify-center w-full h-full">
            <div className="pb-8">
              <p className="text-4xl font-bold inline border-b-4 border-gray-500">WOW</p>
              <p className="py-6">image</p>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:px-5">
              {images.map((image, index) => (
                <div key={index} className="shadow-md shadow-gray-600 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt=""
                    className="rounded-md duration-200 hover:scale-105 bg-cover bg-center w-full h-64 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileBrowser
