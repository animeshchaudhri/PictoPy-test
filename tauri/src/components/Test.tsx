import { useEffect, useState } from "react";
import { homeDir, resolve } from "@tauri-apps/api/path";
import { readDir } from "@tauri-apps/api/fs";
import { convertFileSrc } from "@tauri-apps/api/tauri";

interface File {
  name: string;
  isDir: boolean;
}

const Item = ({
  handleClick,
  file,
}: {
  handleClick: (fileName: string) => void;
  file: File;
}): JSX.Element => (
  <div
    key={file.name}
    className={file.isDir ? "dir" : "file"}
    onClick={() => {
      if (!file.isDir) return;
      handleClick(file.name);
    }}
  >
    {file.isDir ? "📁" : "📄"}
    {file.name}
    {file.isDir ? "/" : ""}
  </div>
);

const FileBrowser = (): JSX.Element => {
  const [files, setFiles] = useState<File[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    async function getHomeDir() {
      const homeDirPath = await homeDir();
      setCurrentPath(homeDirPath);
    }

    getHomeDir();
  }, []);

  useEffect(() => {
    async function getFiles() {
      const contents = await readDir(currentPath);

      const entries = [
        { name: ".", children: [] },
        { name: "..", children: [] },
        ...contents,
      ];

      const names = entries.map((entry) => ({
        name: entry.name || "",
        isDir: !!entry.children,
      }));

      setFiles(names);
    }
    getFiles();
  }, [currentPath]);

  useEffect(() => {
    async function fetchImages() {
      try {
        const contents = await readDir(currentPath);

        const imageFiles = contents.filter((file: any) => {
          return /\.(jpg|jpeg|png|gif)$/i.test(file.name);
        });
        const imageUrls = await Promise.all(
          imageFiles.map(async (file) => {
            return await convertFileSrc(file.path);
          })
        );
        console.log(imageUrls);
        setImages(imageUrls);
      } catch (error) {
        console.error("Error fetching images:", error);
      }
    }

    fetchImages();
  }, [currentPath]);

  async function handleClick(name: string) {
    const newPath = await resolve(currentPath, name);
    setCurrentPath(newPath);
  }

  return (
    <div className="files">
      <div className="dirname">Files in {currentPath}</div>
      <div className="filelist">
        {files.map((file: File) => (
          <Item handleClick={handleClick} file={file} />
        ))}
      </div>
      <div className="images">
        <>
          <div className="bg-gradient-to-b from-black to-gray-800 w-full text-white md:h-screen text-center md:text-left">
            <div className="max-w-screen-lg p-4 mx-auto flex flex-col justify-center w-full h-full">
              <div className="pb-8">
                <p className="text-4xl font-bold inline border-b-4 border-gray-500">
                  WOW{" "}
                </p>
                <p className="py-6">image</p>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:px-5">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="shadow-md shadow-gray-600 rounded-lg overflow-hidden"
                  >
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
        </>
        {/* {images.map((image, index) => (
          <img key={index} src={image} />
        ))} */}
      </div>
    </div>
  );
};

export default FileBrowser;
