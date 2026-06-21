package logger

import (
	"io"
	"log"
	"os"
)

var (
	InfoLogger  *log.Logger
	ErrorLogger *log.Logger

	AppFile   *os.File
	ErrorFile *os.File
)

func Init() error {
	err := os.MkdirAll("logs", os.ModePerm)
	if err != nil {
		return err
	}

	appFile, err := os.OpenFile(
		"logs/app.log",
		os.O_CREATE|os.O_WRONLY|os.O_APPEND,
		0666,
	)
	if err != nil {
		return err
	}

	errorFile, err := os.OpenFile(
		"logs/error.log",
		os.O_CREATE|os.O_WRONLY|os.O_APPEND,
		0666,
	)
	if err != nil {
		return err
	}

	InfoLogger = log.New(
		io.MultiWriter(os.Stdout, appFile),
		"[INFO] ",
		log.Ldate|log.Ltime|log.Lshortfile,
	)

	ErrorLogger = log.New(
		io.MultiWriter(os.Stderr, errorFile),
		"[ERROR] ",
		log.Ldate|log.Ltime|log.Lshortfile,
	)

	return nil
}

func ensureLoggers() {
	if InfoLogger != nil && ErrorLogger != nil {
		return
	}
	// fall back to simple stdout/stderr loggers
	if InfoLogger == nil {
		InfoLogger = log.New(os.Stdout, "[INFO] ", log.Ldate|log.Ltime|log.Lshortfile)
	}
	if ErrorLogger == nil {
		ErrorLogger = log.New(os.Stderr, "[ERROR] ", log.Ldate|log.Ltime|log.Lshortfile)
	}
}

func Info(format string, v ...interface{}) {
	ensureLoggers()
	InfoLogger.Printf(format, v...)
}

func Fatal(format string, v ...interface{}) {
	ensureLoggers()
	ErrorLogger.Printf(format, v...)
	os.Exit(1)
}
func Error(format string, v ...interface{}) {
	ensureLoggers()
	ErrorLogger.Printf(format, v...)
}
