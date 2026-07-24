import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Dialogs 1.3 as LegacyDialogs
import QtQuick.Layouts 1.15

Rectangle {
    id: sidebarRoot
    width: 280
    color: "#101115"

    signal dialImageSelected(url fileUrl)

    Rectangle {
        anchors.right: parent.right
        width: 1
        height: parent.height
        color: "#1F2330"
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 20
        spacing: 24

        // User Profile & Header
        RowLayout {
            Layout.fillWidth: true
            spacing: 12

            Rectangle {
                width: 44
                height: 44
                radius: 22
                color: "#1A1D27"
                border.color: "#00E5FF"
                border.width: 2

                Text {
                    anchors.centerIn: parent
                    text: "⌚"
                    font.pixelSize: 22
                }
            }

            ColumnLayout {
                spacing: 2
                Text {
                    text: "Horology Studio"
                    color: "#FFFFFF"
                    font.pixelSize: 15
                    font.bold: true
                }
                Text {
                    text: "C++ Qt 6 3D Engine"
                    color: "#00E5FF"
                    font.pixelSize: 11
                    font.family: "Monospace"
                }
            }
        }

        // Divider
        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: "#1E2230"
        }

        // Navigation Items
        Text {
            text: "NAVIGATION"
            color: "#5A6178"
            font.pixelSize: 11
            font.bold: true
            font.letterSpacing: 1
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 6

            Repeater {
                model: [
                    { name: "Watch Library", icon: "💎", active: false },
                    { name: "Strap Shop", icon: "🎨", active: false },
                    { name: "3D Try-On", icon: "👁", active: true },
                    { name: "Gallery", icon: "🖼", active: false },
                    { name: "Settings", icon: "⚙", active: false }
                ]

                Rectangle {
                    Layout.fillWidth: true
                    height: 42
                    radius: 8
                    color: modelData.active ? "#1A2234" : "transparent"
                    border.color: modelData.active ? "#00E5FF" : "transparent"
                    border.width: modelData.active ? 1 : 0

                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 12
                        anchors.rightMargin: 12
                        spacing: 12

                        Text {
                            text: modelData.icon
                            font.pixelSize: 16
                        }

                        Text {
                            text: modelData.name
                            color: modelData.active ? "#00E5FF" : "#A0A8C0"
                            font.pixelSize: 13
                            font.bold: modelData.active
                            Layout.fillWidth: true
                        }

                        Rectangle {
                            visible: modelData.active
                            width: 6
                            height: 6
                            radius: 3
                            color: "#00E5FF"
                        }
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        onEntered: {
                            if (!modelData.active) parent.color = "#161923"
                        }
                        onExited: {
                            if (!modelData.active) parent.color = "transparent"
                        }
                    }
                }
            }
        }

        Item { Layout.fillHeight: true }

        // Dial Image Upload Section
        Rectangle {
            Layout.fillWidth: true
            height: 140
            radius: 12
            color: "#141722"
            border.color: "#222736"
            border.width: 1

            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 14
                spacing: 10

                Text {
                    text: "CUSTOM DIAL MAPPER"
                    color: "#8A94B2"
                    font.pixelSize: 10
                    font.bold: true
                    font.letterSpacing: 1
                }

                Text {
                    text: "Upload `.jpg` or `.png` dial graphics directly onto 3D mesh"
                    color: "#6B7594"
                    font.pixelSize: 11
                    wrapMode: Text.WordWrap
                    Layout.fillWidth: true
                }

                Button {
                    Layout.fillWidth: true
                    height: 36

                    contentItem: RowLayout {
                        spacing: 8
                        alignment: Qt.AlignHCenter
                        Text { text: "📁"; font.pixelSize: 14 }
                        Text {
                            text: "Upload Custom Dial"
                            color: "#FFFFFF"
                            font.pixelSize: 12
                            font.bold: true
                        }
                    }

                    background: Rectangle {
                        radius: 6
                        gradient: Gradient {
                            GradientStop { position: 0.0; color: "#00B0FF" }
                            GradientStop { position: 1.0; color: "#00E5FF" }
                        }
                    }

                    onClicked: {
                        dialFileDialog.open()
                    }
                }
            }
        }
    }

    LegacyDialogs.FileDialog {
        id: dialFileDialog
        title: "Select Custom Watch Dial Image"
        folder: shortcuts.pictures
        nameFilters: [ "Image files (*.jpg *.jpeg *.png *.bmp)", "All files (*)" ]
        onAccepted: {
            sidebarRoot.dialImageSelected(dialFileDialog.fileUrl)
        }
    }
}
