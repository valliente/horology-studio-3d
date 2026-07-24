import QtQuick 2.15
import QtQuick.Window 2.15
import QtQuick.Controls 2.15
import QtQuick.Layouts 1.15
import QtQuick3D 6.2
import QtQuick3D.Helpers 6.2

Window {
    id: mainWindow
    width: 1280
    height: 800
    visible: true
    title: "Horology Studio 3D - Native Qt 6 C++ Engine"
    color: "#0B0C10"

    RowLayout {
        anchors.fill: parent
        spacing: 0

        // Left Sidebar Navigation
        Sidebar {
            id: sidebar
            Layout.fillHeight: true
            onDialImageSelected: function(fileUrl) {
                dialController.selectDialFile(fileUrl)
            }
        }

        // Center Viewport Area
        Rectangle {
            id: viewportContainer
            Layout.fillWidth: true
            Layout.fillHeight: true
            color: "#08090C"

            // 3D Viewport Scene
            View3D {
                id: view3d
                anchors.fill: parent
                environment: SceneEnvironment {
                    clearColor: "#0A0B0E"
                    backgroundMode: SceneEnvironment.Color
                    antialiasingMode: SceneEnvironment.MSAA
                    antialiasingQuality: SceneEnvironment.High
                }

                PerspectiveCamera {
                    id: camera
                    position: Qt.vector3d(0, 40, 120)
                    eulerRotation: Qt.vector3d(-20, 0, 0)
                    clipNear: 0.1
                    clipFar: 1000.0
                }

                DirectionalLight {
                    eulerRotation: Qt.vector3d(-45, 35, 0)
                    brightness: 1.8
                    color: "#FFFFFF"
                    ambientColor: "#404555"
                }

                DirectionalLight {
                    eulerRotation: Qt.vector3d(40, -120, 0)
                    brightness: 0.8
                    color: "#00E5FF"
                }

                PointLight {
                    position: Qt.vector3d(0, 80, 50)
                    brightness: 2.0
                    color: "#FFFFFF"
                }

                // 3D Watch Assembly Node
                Node {
                    id: watchModelNode

                    // Outer Watch Case (Brushed Steel)
                    Model {
                        id: watchCase
                        source: "#Cylinder"
                        scale: Qt.vector3d(0.8, 0.12, 0.8)
                        materials: [
                            PrincipledMaterial {
                                baseColor: "#CCCCCC"
                                metalness: 0.95
                                roughness: 0.2
                                specularAmount: 0.9
                            }
                        ]
                    }

                    // Watch Bezel Ring
                    Model {
                        id: watchBezel
                        source: "#Cylinder"
                        position: Qt.vector3d(0, 6.2, 0)
                        scale: Qt.vector3d(0.78, 0.02, 0.78)
                        materials: [
                            PrincipledMaterial {
                                baseColor: "#11141A"
                                metalness: 0.8
                                roughness: 0.1
                            }
                        ]
                    }

                    // Watch Dial Face (Dynamic Texture Mapping)
                    Model {
                        id: watchDialMesh
                        source: "#Cylinder"
                        position: Qt.vector3d(0, 6.4, 0)
                        scale: Qt.vector3d(0.74, 0.01, 0.74)
                        materials: [
                            PrincipledMaterial {
                                baseColor: "#181B24"
                                baseColorMap: Texture {
                                    source: dialController.dialTextureUrl
                                    tilingModeHorizontal: Texture.ClampToEdge
                                    tilingModeVertical: Texture.ClampToEdge
                                }
                                roughness: 0.4
                                metalness: 0.1
                            }
                        ]
                    }

                    // Dial Center Pin & Hands
                    Model {
                        id: dialHandsPin
                        source: "#Cylinder"
                        position: Qt.vector3d(0, 7.2, 0)
                        scale: Qt.vector3d(0.04, 0.03, 0.04)
                        materials: [
                            PrincipledMaterial {
                                baseColor: "#00E5FF"
                                metalness: 0.9
                                roughness: 0.1
                            }
                        ]
                    }

                    // Hour Hand
                    Model {
                        id: hourHand
                        source: "#Cube"
                        position: Qt.vector3d(0, 7.4, -12)
                        scale: Qt.vector3d(0.04, 0.01, 0.24)
                        materials: [
                            PrincipledMaterial {
                                baseColor: "#FFFFFF"
                                metalness: 0.9
                                roughness: 0.2
                            }
                        ]
                    }

                    // Minute Hand
                    Model {
                        id: minuteHand
                        source: "#Cube"
                        position: Qt.vector3d(14, 7.5, 0)
                        scale: Qt.vector3d(0.32, 0.01, 0.03)
                        materials: [
                            PrincipledMaterial {
                                baseColor: "#00E5FF"
                                metalness: 0.9
                                roughness: 0.1
                            }
                        ]
                    }

                    // 3D Sapphire Crystal Glass Cover
                    Model {
                        id: sapphireCrystal
                        source: "#Cylinder"
                        position: Qt.vector3d(0, 7.8, 0)
                        scale: Qt.vector3d(0.77, 0.01, 0.77)
                        materials: [
                            PrincipledMaterial {
                                baseColor: "#15A0E5FF"
                                metalness: 0.1
                                roughness: 0.05
                                opacity: 0.25
                                specularAmount: 1.0
                            }
                        ]
                    }

                    // Top & Bottom Straps
                    Model {
                        id: topStrap
                        source: "#Cube"
                        position: Qt.vector3d(0, 0, -60)
                        scale: Qt.vector3d(0.48, 0.06, 0.5)
                        materials: [
                            PrincipledMaterial {
                                baseColor: dialController.strapColor
                                roughness: 0.6
                                metalness: 0.1
                            }
                        ]
                    }

                    Model {
                        id: bottomStrap
                        source: "#Cube"
                        position: Qt.vector3d(0, 0, 60)
                        scale: Qt.vector3d(0.48, 0.06, 0.5)
                        materials: [
                            PrincipledMaterial {
                                baseColor: dialController.strapColor
                                roughness: 0.6
                                metalness: 0.1
                            }
                        ]
                    }
                }
            }

            // Mouse Interactive Orbit Controller
            MouseArea {
                id: orbitController
                anchors.fill: parent
                property point lastPos: Qt.point(0, 0)

                onPressed: function(mouse) {
                    lastPos = Qt.point(mouse.x, mouse.y)
                }

                onPositionChanged: function(mouse) {
                    if (pressedButtons & Qt.LeftButton) {
                        var deltaX = mouse.x - lastPos.x
                        var deltaY = mouse.y - lastPos.y

                        watchModelNode.eulerRotation.y += deltaX * 0.4
                        watchModelNode.eulerRotation.x += deltaY * 0.4

                        lastPos = Qt.point(mouse.x, mouse.y)
                    }
                }

                onWheel: function(wheel) {
                    var zoomFactor = wheel.angleDelta.y > 0 ? -8 : 8
                    camera.position.z = Math.max(40, Math.min(300, camera.position.z + zoomFactor))
                }
            }

            // Floating Header Over 3D Viewport
            RowLayout {
                anchors.top: parent.top
                anchors.right: parent.right
                anchors.margins: 24
                spacing: 14

                // Electric Blue PRO Badge
                Rectangle {
                    width: 64
                    height: 28
                    radius: 14
                    gradient: Gradient {
                        GradientStop { position: 0.0; color: "#00B0FF" }
                        GradientStop { position: 1.0; color: "#00E5FF" }
                    }

                    Text {
                        anchors.centerIn: parent
                        text: "PRO"
                        color: "#0A0C10"
                        font.pixelSize: 12
                        font.bold: true
                        font.letterSpacing: 1.5
                    }
                }

                Rectangle {
                    width: 140
                    height: 28
                    radius: 14
                    color: "#12151E"
                    border.color: "#222736"

                    Text {
                        anchors.centerIn: parent
                        text: "v1.0.0 (Native C++)"
                        color: "#7A84A0"
                        font.pixelSize: 11
                    }
                }
            }

            // Viewport Controls Overlay Info
            Rectangle {
                anchors.bottom: parent.bottom
                anchors.left: parent.left
                anchors.margins: 20
                width: 220
                height: 40
                radius: 8
                color: "#CC10121A"
                border.color: "#222736"

                RowLayout {
                    anchors.centerIn: parent
                    spacing: 8
                    Text { text: "🖱"; font.pixelSize: 13 }
                    Text {
                        text: "Drag: Rotate 360° | Scroll: Zoom"
                        color: "#8B95B0"
                        font.pixelSize: 11
                    }
                }
            }

            // Right Strap Selector Overlay
            StrapSelector {
                id: strapOverlay
                anchors.right: parent.right
                anchors.bottom: parent.bottom
                anchors.margins: 24
                onStrapSelected: function(strapName, hexColor) {
                    dialController.applyPresetStrap(strapName, hexColor)
                }
            }
        }
    }
}
