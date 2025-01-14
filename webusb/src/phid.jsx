import React, { useState } from 'react';

const WebHID = () => {
    const [output, setOutput] = useState('');
    let device;

    const connectHID = async () => {
        try {
            const devices = await navigator.hid.requestDevice({
                filters: [] // Puedes filtrar dispositivos específicos aquí
            });

            if (devices.length === 0) {
                console.log('No se seleccionó ningún dispositivo.');
                return;
            }

            device = devices[0];
            await device.open();
            console.log('Conectado al dispositivo HID:', device.productName);

            device.addEventListener('inputreport', event => {
                const { data } = event;
                const dataArray = new Uint8Array(data.buffer);
                const hexString = Array.from(dataArray)
                    .map(byte => byte.toString(16).padStart(2, '0'))
                    .join(' ');

                setOutput(prevOutput => prevOutput + '\n' + hexString);
            });

        } catch (error) {
            console.error('Error al conectar con el dispositivo HID:', error);
        }
    };

    const sendCommand = async (command) => {
        try {
            if (!device || !device.opened) {
                console.error('No hay ningún dispositivo conectado.');
                return;
            }

            const reportId = device.collections[0]?.outputReports[0]?.reportId || 0;
            await device.sendReport(reportId, new Uint8Array(command));
            console.log('Comando enviado:', command);
        } catch (error) {
            console.error('Error al enviar comando:', error);
        }
    };

    const disconnectHID = async () => {
        if (device && device.opened) {
            await device.close();
            console.log('Dispositivo desconectado.');
        }
    };

    return (
        <div className="hid-container">
            <h1 className="title">Web HID API - RFID</h1>
            <button className="connect-button" onClick={connectHID}>Conectar al Dispositivo HID</button>
            <button className="command-button" onClick={() => sendCommand([0x0410, 0x0102,0x0101])}>
                Leer Datos de la Etiqueta
            </button>
            <button className="disconnect-button" onClick={disconnectHID}>
                Desconectar Dispositivo HID
            </button>
            <pre className="output-console">{output}</pre>
        </div>
    );
};

export default WebHID;
