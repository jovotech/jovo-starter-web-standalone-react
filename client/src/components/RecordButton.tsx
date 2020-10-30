import { RequestType } from 'jovo-client-web';
import React from 'react';
import { Mic, Play } from 'react-feather';
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
    const icon = this.props.isInitialized ? (
      <Mic className="text-gray-700 dark:text-gray-300" />
    ) : (
      <Play className="text-gray-700" />
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
      await client.createRequest({ type: RequestType.Launch }).send();
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
    await client.startInputRecording();
  };

  onMouseUp = (event: MouseEvent | TouchEvent) => {
    if (event instanceof MouseEvent) {
      window.removeEventListener('mouseup', this.onMouseUp);
    } else {
      window.removeEventListener('touchend', this.onMouseUp);
    }
    client.stopInputRecording();
  };

  onKeyDown = async (event: KeyboardEvent) => {
    if (event.key === ' ') {
      window.addEventListener('keyup', this.onKeyUp);
      await client.startInputRecording();
    }
  };

  onKeyUp = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      window.removeEventListener('keyup', this.onKeyUp);
      client.stopInputRecording();
    }
  };
}
