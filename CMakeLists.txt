cmake_minimum_required(VERSION 3.16)

project(HorologyStudio3D VERSION 1.0.0 LANGUAGES CXX C)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

find_package(Qt6 6.2 REQUIRED COMPONENTS
    Core
    Gui
    Qml
    Quick
    Quick3D
)

qt_standard_project_setup()

set(PROJECT_SOURCES
    src/main.cpp
    src/DialController.h
    src/DialController.cpp
    app.manifest
    resource.rc
)

qt_add_executable(HorologyStudio3D
    ${PROJECT_SOURCES}
)

qt_add_qml_module(HorologyStudio3D
    URI HorologyStudio3D
    VERSION 1.0
    QML_FILES
        qml/main.qml
        qml/Sidebar.qml
        qml/StrapSelector.qml
)

target_include_directories(HorologyStudio3D PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/src
)

target_link_libraries(HorologyStudio3D PRIVATE
    Qt6::Core
    Qt6::Gui
    Qt6::Qml
    Qt6::Quick
    Qt6::Quick3D
)

if(MSVC)
    target_compile_options(HorologyStudio3D PRIVATE /W4 /permissive-)
endif()

set_target_properties(HorologyStudio3D PROPERTIES
    MACOSX_BUNDLE TRUE
    WIN32_EXECUTABLE TRUE
)
