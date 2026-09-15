# frozen_string_literal: true

# Ruby 3.2 removed Object#tainted? / #taint / #untaint, but liquid 4.0.3 (pinned
# by the github-pages gem) still calls them in Liquid::Variable#taint_check.
# Without this shim, `jekyll build` dies with:
#   Liquid Exception: undefined method 'tainted?' for an instance of String
#
# Loaded by run_server.sh via RUBYOPT (not as a jekyll plugin: the github-pages
# gem forces safe mode, so _plugins is ignored). No effect on the deployed site.
if RUBY_VERSION >= "3.2" && !Object.new.respond_to?(:tainted?)
  class Object
    def tainted?
      false
    end

    def taint
      self
    end

    def untaint
      self
    end
  end
end
