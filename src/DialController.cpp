#include "DialController.h"
#include <QDebug>

DialController::DialController(QObject *parent)
    : QObject(parent)
    , m_dialTextureUrl(QUrl())
    , m_currentStrap("Vintage Leather")
    , m_strapColor("#5C3A21")
{
}

QUrl DialController::dialTextureUrl() const
{
    return m_dialTextureUrl;
}

void DialController::setDialTextureUrl(const QUrl &url)
{
    if (m_dialTextureUrl != url) {
        m_dialTextureUrl = url;
        qDebug() << "[DialController] Dial texture updated:" << url;
        emit dialTextureUrlChanged();
    }
}

QString DialController::currentStrap() const
{
    return m_currentStrap;
}

void DialController::setCurrentStrap(const QString &strap)
{
    if (m_currentStrap != strap) {
        m_currentStrap = strap;
        qDebug() << "[DialController] Strap variant updated:" << strap;
        emit currentStrapChanged();
    }
}

QString DialController::strapColor() const
{
    return m_strapColor;
}

void DialController::setStrapColor(const QString &color)
{
    if (m_strapColor != color) {
        m_strapColor = color;
        qDebug() << "[DialController] Strap color updated:" << color;
        emit strapColorChanged();
    }
}

void DialController::selectDialFile(const QUrl &fileUrl)
{
    setDialTextureUrl(fileUrl);
}

void DialController::applyPresetStrap(const QString &strapName, const QString &hexColor)
{
    setCurrentStrap(strapName);
    setStrapColor(hexColor);
}
