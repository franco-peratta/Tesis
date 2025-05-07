import React from 'react';
import { Statistic } from 'antd';
import CountUp from 'react-countup';
import type { StatisticProps } from 'antd';

interface AnimatedStatisticProps extends StatisticProps {
    value: number;
    duration?: number;
}

export const AnimatedStatistic: React.FC<AnimatedStatisticProps> = ({
    value,
    duration = 1,
    precision = 0,
    suffix,
    prefix,
    ...rest
}) => {
    return (
        <Statistic
            {...rest}
            value={value}
            precision={precision}
            suffix={suffix}
            prefix={prefix}
            valueRender={() => (
                <CountUp
                    end={value}
                    duration={duration}
                    separator=","
                    decimals={precision}
                    prefix={prefix?.toString()}
                    suffix={suffix?.toString()}
                />
            )}
        />
    );
};
