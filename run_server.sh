#!/usr/bin/env bash
# Local preview server: http://127.0.0.1:4000 (LiveReload on :35729)
#
# Ruby 3.2 removed Object#tainted?, but liquid 4.0.3 -- pinned by the
# github-pages gem -- still calls it, so jekyll dies while rendering. The
# github-pages gem also forces safe mode, which means a file in _plugins is
# never loaded; the shim has to be injected into ruby itself instead.
here="$(cd "$(dirname "$0")" && pwd)"
export RUBYOPT="-r${here}/.dev/taint_shim.rb${RUBYOPT:+ ${RUBYOPT}}"

exec bundle exec jekyll liveserve "$@"
