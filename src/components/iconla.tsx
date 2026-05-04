import React from 'react';
import { Select } from 'antd';

const handleChange = (value: string) => {
    console.log(`selected ${value}`);
};

const Icon: React.FC = () => (

    <Select
        defaultValue="亮色"
        style={{ width: 120 }}
        onChange={handleChange}
        options={[
            { value: '亮色', label: '亮色' },
            { value: '暗色', label: '暗色' },
        ]}
    />

)
export default Icon;