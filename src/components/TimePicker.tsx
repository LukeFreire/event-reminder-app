import { useState } from "react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

function TimePicker({ value, onChange, placeholder }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  function handleDone() {
    let hour24 = Number(hour);

    if (period === "PM" && hour24 !== 12) {
      hour24 += 12;
    }

    if (period === "AM" && hour24 === 12) {
      hour24 = 0;
    }

    const formattedTime = `${hour24
      .toString()
      .padStart(2, "0")}:${minute}`;

    onChange(formattedTime);
    setIsOpen(false);
  }

  return (
    <div className="time-picker-container">
      <button
        type="button"
        className="time-picker-input"
        onClick={() => setIsOpen(true)}
      >
        {value ? value : placeholder}
      </button>

      {isOpen && (
        <div className="time-picker-popup">
          <div className="time-picker-wheels">
            <select
              value={hour}
              onChange={(e) => setHour(e.target.value)}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const hourValue = String(i + 1).padStart(2, "0");

                return (
                  <option key={hourValue} value={hourValue}>
                    {hourValue}
                  </option>
                );
              })}
            </select>

            <span>:</span>

            <select
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
            >
              {Array.from({ length: 60 }, (_, i) => {
                const minuteValue = String(i).padStart(2, "0");

                return (
                  <option key={minuteValue} value={minuteValue}>
                    {minuteValue}
                  </option>
                );
              })}
            </select>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={handleDone}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export default TimePicker;