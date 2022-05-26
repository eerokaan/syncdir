# syncdir

syncdir is an application assisting file transfers of directories across different locations. This might come in handy, when synchronizing multiple Virtual Machines over a network share between multiple different host machines, for example.

## Features

- Multi Platform: Support for Linux (.AppImage) and Windows (.exe)
- Proven Backbone: Based on rsync (Linux) or Robocopy (Windows) respectively
- Support for two-way sync (Push and Pull configurations possible)
- Checks before file transfer if enough space is available on destination
- Overwrite at destination only after completed successful file transfer
- Saves sync configurations in background so that settings stay persistent

## Build

For detailed compile settings, please refer to the `package.json` file.

Build for Linux and Windows via the `npx electron-builder build -lw` command.

## Usage

```
./syncdir-<VERSION>-<ARCH>.AppImage
./syncdir-<VERSION>-<ARCH>.exe
```

## License

syncdir is published under the [GPL-3.0 license](https://www.gnu.org/licenses/gpl-3.0.en.html).