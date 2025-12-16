// Диаграмма аналитики доходов и расходов пользователя
import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

const FinanceChart = ({ income = 0, expense = 0 }) => {
  const data = {
    labels: ['Доходы', 'Расходы'],
    datasets: [
      {
        data: [income, expense],
        backgroundColor: ['#22c55e', '#ef4444'],
        borderWidth: 1,
      },
    ],
  }

  return <Pie data={data} />
}

export default FinanceChart


