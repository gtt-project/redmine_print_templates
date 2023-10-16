# Redmine GTT pdfme Plugin

The Redmine GTT pdfme plugin enables printing templates with [pdfme](https://www.pdfme.com/)
in Redmine installations.

## Requirements

- Redmine >= 5.0.0
- NodeJS >= v18
- yarn

## Installation

To install Redmine GTT pdfme plugin, download or clone this repository in your
Redmine installation plugins directory!

```sh
cd path/to/plugin/directory
git clone https://github.com/gtt-project/redmine_gtt_pdfme.git
cd redmine_gtt_pdfme
yarn
npx webpack
```

Then run

```sh
bundle install
bundle exec rake redmine:plugins:migrate
```

After restarting Redmine, you should be able to see the Redmine Chatwoot plugin
in the Plugins page.

More information on installing (and uninstalling) Redmine plugins can be found
here: http://www.redmine.org/wiki/redmine/Plugins

## How to use

The plugin configuration is available in Redmine's plugin list:
https://localhost:3000/admin/plugins

## Contributing and Support

The GTT Project appreciates any [contributions](https://github.com/gtt-project/.github/blob/main/CONTRIBUTING.md)!
Feel free to contact us for [reporting problems and support](https://github.com/gtt-project/.github/blob/main/CONTRIBUTING.md).

### How to debug frontend

You can debug frontend by running the following command on another console:

```sh
npx webpack --watch --mode=development --devtool=source-map
```

## Version History

See [all releases](https://github.com/gtt-project/redmine_gtt_pdfme/releases)
with release notes.

## Authors

- [Daniel Kastl](https://github.com/dkastl)
- ... [and others](https://github.com/gtt-project/redmine_gtt_pdfme/graphs/contributors)

## LICENSE

This program is free software. See [LICENSE](LICENSE) for more information.
