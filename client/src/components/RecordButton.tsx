import { InputType } from '@jovotech/client-web';
import React from 'react';
import client from './../client';

export default class RecordButton extends React.Component<{
  isRecording: boolean;
  isInitialized: boolean;
}> {
  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
  }

  render() {
    let className = 'bg-gray-100 dark:bg-gray-800 rounded-full p-8 focus:outline-none shadow-2xl';
    if (client.isRecordingInput) {
      className += 'shadow-inner animate-ripple dark:animate-ripple-dark';
    }
    const icon = !this.props.isInitialized ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-gray-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 5l7 7-7 7M5 5l7 7-7 7"
        />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-gray-700 dark:text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
    );
    return (
      <button
        className={className}
        onMouseDown={this.onMouseDown}
        onTouchStart={this.onMouseDown}
        onClick={this.onClick}
      >
        {icon}
      </button>
    );
  }

  onClick = async (event: React.MouseEvent) => {
    if (!this.props.isInitialized) {
      await client.initialize();
      await client.send({ type: InputType.Launch });
      window.addEventListener('keydown', this.onKeyDown);
    }
  };

  onMouseDown = async (event: React.MouseEvent | React.TouchEvent) => {
    if (this.props.isInitialized) {
      event.preventDefault();
    }
    if (client.isRecordingInput || !this.props.isInitialized) {
      return;
    }

    window.addEventListener(event.type === 'mousedown' ? 'mouseup' : 'touchend', this.onMouseUp);
    await client.startRecording();
  };

  onMouseUp = (event: MouseEvent | TouchEvent) => {
    if (event instanceof MouseEvent) {
      window.removeEventListener('mouseup', this.onMouseUp);
    } else {
      window.removeEventListener('touchend', this.onMouseUp);
    }
    client.stopRecording();
  };

  onKeyDown = async (event: KeyboardEvent) => {
    if (event.key === ' ') {
      window.addEventListener('keyup', this.onKeyUp);
      await client.startRecording();
    }
  };

  onKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      window.removeEventListener('keyup', this.onKeyUp);
      client.stopRecording();
    }
  };
}
