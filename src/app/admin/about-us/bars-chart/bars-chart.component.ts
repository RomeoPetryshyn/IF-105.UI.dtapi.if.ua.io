import { Component, OnInit } from '@angular/core';
import { AboutUsService } from '../about-us.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-bars-chart',
  templateUrl: './bars-chart.component.html',
  styleUrls: ['./bars-chart.component.scss']
})
export class BarsChartComponent implements OnInit {

  constructor(private aboutUsService: AboutUsService) { }

  public chardReady = false;

  public barChartLabels: string[] = [];
  public barChartType  = 'bar';
  public barChartLegend = true;
  public barChartData;
  public barChartOptions = {
    scaleShowVerticalLines: true,
    responsive: true,
    scales: {
      yAxes: [{
        gridLines: {
          zeroLineColor: 'black',
          zeroLineWidth: 1
        },
        ticks: {
          min: 0,
          max: 100
        },
        scaleLabel: {
          display: true,
          labelString: 'Кількість коммітів на репозиторій'
        }
      }],
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: `Ім'я користувача на GitHub`
        }
      }]
    }
  };

  ngOnInit() {
    this.getUserNames();
    this.getCommitsAmount();
  }

  private async getContributorsInfo() {
    return this.aboutUsService.getContributorsData().toPromise();
  }

  private async getUserNickNames() {
    const data: any = await this.getContributorsInfo();
    const nickNames = data.map(item => {
      return item.author.login;
    });
    return nickNames;
  }

  private async getUserNames() {
    const data: any = await this.getUserNickNames();
    const someConst$: any = data.map(element => {
      return this.aboutUsService.getUserNames(element);
    });
    forkJoin(someConst$).subscribe((result: any) => {
      this.barChartLabels = result.map(element => {
        return element.name !== null ? element.name  : element.login;
      });
    });
  }

  private async getCommitsAmount() {
    const data: any = await this.getContributorsInfo();
    const commitsAmount: number[] = data.map(item => {
      return item.total;
    });
    return this.chartData(commitsAmount);
  }

  private chartData(data) {
    this.barChartData = [{
      data,
      label: 'Комміти розробника',
      minBarLength: 0
    }];
    this.chardReady = true;
  }
}