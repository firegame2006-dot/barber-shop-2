"""Static dev server that never lets the browser cache a file.

http.server's default 304 handling makes edited CSS/JS look like it did not
change, which silently invalidates any visual check. This sends no-store on
every response so a reload always fetches the current file.
"""

import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_header(self, keyword, value):
        # Drop the validator that would otherwise trigger a 304
        if keyword.lower() == "last-modified":
            return
        super().send_header(keyword, value)

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5173
    print("serving on http://localhost:%d (no-store)" % port)
    ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler).serve_forever()
