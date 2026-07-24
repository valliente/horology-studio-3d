#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QQuickWindow>
#include <QSurfaceFormat>
#include <QIcon>
#include "DialController.h"

int main(int argc, char *argv[])
{
    QGuiApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
    QGuiApplication::setHighDpiScaleFactorRoundingPolicy(Qt::HighDpiScaleFactorRoundingPolicy::PassThrough);

    QSurfaceFormat::setDefaultFormat(QQuickWindow::hasDefaultAlphaBuffer() ? QSurfaceFormat::defaultFormat() : QSurfaceFormat());

    QGuiApplication app(argc, argv);
    app.setOrganizationName("HorologyStudio");
    app.setOrganizationDomain("horology.studio");
    app.setApplicationName("Horology Studio 3D");

    QQmlApplicationEngine engine;

    DialController dialController;
    engine.rootContext()->setContextProperty("dialController", &dialController);

    const QUrl url(QStringLiteral("qrc:/qt/qml/HorologyStudio3D/qml/main.qml"));
    
    QObject::connect(
        &engine,
        &QQmlApplicationEngine::objectCreated,
        &app,
        [url](QObject *obj, const QUrl &objUrl) {
            if (!obj && url == objUrl)
                QCoreApplication::exit(-1);
        },
        Qt::QueuedConnection);

    // Fallback load from local file system if QRC is not used
    engine.load(url);
    if (engine.rootObjects().isEmpty()) {
        engine.load(QUrl::fromLocalFile("qml/main.qml"));
    }

    return app.exec();
}
