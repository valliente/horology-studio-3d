import QtQuick 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15

Rectangle {
    id: strapSelectorRoot
    width: 300
    height: 380
    radius: 16
    color: "#14161E"
    border.color: "#222736"
    border.width: 1

    signal strapSelected(string strapName, string hexColor)

    property string activeStrap: "Vintage Leather"

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 18
        spacing: 14

        RowLayout {
            Layout.fillWidth: true
            Text {
                text: "STRAP SELECTION"
                color: "#FFFFFF"
                font.pixelSize: 13
                font.bold: true
                font.letterSpacing: 1
                Layout.fillWidth: true
            }

            Rectangle {
                width: 24
                height: 24
                radius: 12
                color: "#1A202C"
                Text {
                    anchors.centerIn: parent
                    text: "🎨"
                    font.pixelSize: 12
                }
            }
        }

        Text {
            text: "Switch between 3D strap materials & textures"
            color: "#6B7594"
            font.pixelSize: 11
        }

        Rectangle {
            Layout.fillWidth: true
            height: 1
            color: "#1E2230"
        }

        ColumnLayout {
            Layout.fillWidth: true
            spacing: 8

            Repeater {
                model: [
                    { name: "Vintage Leather", color: "#5C3A21", desc: "Handcrafted Italian Leather" },
                    { name: "NATO Fabric", color: "#2C3E50", desc: "Military Nylon Weave" },
                    { name: "Milanese Loop", color: "#B0B5BC", desc: "Brushed Stainless Steel Mesh" },
                    { name: "Rubber", color: "#1A1A1A", desc: "Sport Vulcanized Silicone" }
                ]

                Rectangle {
                    Layout.fillWidth: true
                    height: 52
                    radius: 10
                    color: activeStrap === modelData.name ? "#1B2234" : "#10121A"
                    border.color: activeStrap === modelData.name ? "#00E5FF" : "#1E2332"
                    border.width: 1

                    RowLayout {
                        anchors.fill: parent
                        anchors.leftMargin: 12
                        anchors.rightMargin: 12
                        spacing: 12

                        Rectangle {
                            width: 28
                            height: 28
                            radius: 14
                            color: modelData.color
                            border.color: "#FFFFFF"
                            border.width: 1
                        }

                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 2
                            Text {
                                text: modelData.name
                                color: activeStrap === modelData.name ? "#FFFFFF" : "#C0C8E0"
                                font.pixelSize: 12
                                font.bold: true
                            }
                            Text {
                                text: modelData.desc
                                color: "#5E6680"
                                font.pixelSize: 10
                            }
                        }

                        Rectangle {
                            visible: activeStrap === modelData.name
                            width: 18
                            height: 18
                            radius: 9
                            color: "#00E5FF"
                            Text {
                                anchors.centerIn: parent
                                text: "✓"
                                color: "#000000"
                                font.pixelSize: 10
                                font.bold: true
                            }
                        }
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        onEntered: {
                            if (activeStrap !== modelData.name) parent.color = "#161B28"
                        }
                        onExited: {
                            if (activeStrap !== modelData.name) parent.color = "#10121A"
                        }
                        onClicked: {
                            activeStrap = modelData.name
                            strapSelectorRoot.strapSelected(modelData.name, modelData.color)
                        }
                    }
                }
            }
        }
    }
}
