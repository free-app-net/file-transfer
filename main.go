package main

import (
	"embed"
	"file-transfer/server"
	"io/fs"
	"os"
	"strconv"
)

//go:embed dist
var webapp embed.FS

func main() {
	var host string
	if os.Getenv("HOST") != "" {
		host = os.Getenv("HOST")
	} else {
		host = "0.0.0.0"
	}

	var port int
	if os.Getenv("PORT") != "" {
		port, _ = strconv.Atoi(os.Getenv("PORT"))
	} else {
		port = 3000
	}

	Fs, err := fs.Sub(webapp, "dist")
	if err != nil {
		panic(err)
	}

	server.Run(server.RunOpts{
		Host: host,
		Port: port,
		Fs:   Fs,
	})
}
