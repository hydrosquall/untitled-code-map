# Untitled Code Map

![code_map_thumbnail](https://p-qKFgO2.t2.n0.cdn.getcloudapp.com/items/p9uzBQJR/Image+2019-11-08+at+9.37.44+PM.png?v=dc9e10e6760f32e41bb2f3b7ec22d4f9)
_The shape of Susie Lu's [d3-legend](https://d3-legend.susielu.com/)_

An offline desktop app for making interactive diagrams of git repository folders. This builds on an article developed by [Amelia Wattenberger](https://wattenberger.com/).

Current variables visualized on the folder hierarchy include:

- Filetype
- Date last modified
- Number of edits
- Filesize

This software is in the `alpha` stage, so please feel welcome to report bugs or feature requests.

## Setup

```bash
yarn install

# Development
yarn dev

# Build an installable binary
yarn build
```

If you're just looking to explore the test React repository, you're done!

If you'd like to analyze your own local repositories, continue reading.

## Usage Notes

1. Click the "folder" icon to select a folder,
2. Click the "refresh" icon to analyze and visualize that folder.
3. Please be patient if the folder you've selected has a long git history or a large amount of files.

By default, we ignore `.git` and `node_modules` folders when traversing the filesystem.

## Roadmap

Please reach out with an issue or PR if you're interested in helping.

### Probable

- Integration with other types of code map (module dependencies, etc)
- Add `redux-toolkit`
- Permit importing JSON file instead of running the script directly, or cache previous results

### Possible

- Make getting git metrics optional if performance is an issue
- Hyperbolic tree layout
- Performance improvements
- Supply your own react repository base URL, or open on filesystem instead
- Customize colors used to map to each folder type
- Customize data ranges for the color scales (currently hardcoded)
- Searching/filtering/highlighting
- Typescript
- Loading/Error indicators + handling
- Make logic clearer with a state machine

## Attributions

This project was made possible by the generosity of several open source projects, especially

- [`react-electron-boilerplate`](https://github.com/electron-react-boilerplate)
- James Long's [Electron with Server Example](https://github.com/jlongster/electron-with-server-example)
  - Enables hot-patching server without restarting the electron process
  - Enables using Chrome browser devtools for a server process
- Amelia Wattenberger's [React Repository](https://github.com/Wattenberger/Wattenberger-2019/tree/master/src/components/Articles/ReactRepo)

## Why Untitled Code Map?

On Untitled:

> There are 2 hard problems in computer science: cache invalidation, naming things, and off-by-1 errors. -- Leon Bambrick

On Visualizing Code: [Frontend Code Maps](https://github.com/hydrosquall/code-maps-frontend)
