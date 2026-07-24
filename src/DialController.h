#ifndef DIALCONTROLLER_H
#define DIALCONTROLLER_H

#include <QObject>
#include <QString>
#include <QUrl>
#include <qqmlintegration.h>

class DialController : public QObject
{
    Q_OBJECT
    QML_ELEMENT

    Q_PROPERTY(QUrl dialTextureUrl READ dialTextureUrl WRITE setDialTextureUrl NOTIFY dialTextureUrlChanged)
    Q_PROPERTY(QString currentStrap READ currentStrap WRITE setCurrentStrap NOTIFY currentStrapChanged)
    Q_PROPERTY(QString strapColor READ strapColor WRITE setStrapColor NOTIFY strapColorChanged)

public:
    explicit DialController(QObject *parent = nullptr);

    QUrl dialTextureUrl() const;
    void setDialTextureUrl(const QUrl &url);

    QString currentStrap() const;
    void setCurrentStrap(const QString &strap);

    QString strapColor() const;
    void setStrapColor(const QString &color);

    Q_INVOKABLE void selectDialFile(const QUrl &fileUrl);
    Q_INVOKABLE void applyPresetStrap(const QString &strapName, const QString &hexColor);

signals:
    void dialTextureUrlChanged();
    void currentStrapChanged();
    void strapColorChanged();

private:
    QUrl m_dialTextureUrl;
    QString m_currentStrap;
    QString m_strapColor;
};

#endif // DIALCONTROLLER_H
