import {AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, ViewChild} from '@angular/core';
import {DataSetDataItem, DataSetDataGroup, DataGroup, DataItem, Timeline, TimelineOptions} from 'vis-timeline';
import {DataSet} from 'vis-data';
import {TimelineItem} from 'vis-timeline/types';
import {addWeeks} from 'date-fns';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.css'
})
export class TimelineComponent implements AfterViewInit, OnChanges {
  @ViewChild('timeline') timelineContainer!: ElementRef;
  private timeline!: Timeline;

  @Input() items: DataItem[] = [];
  @Input() groups: DataGroup[] = [];

  groupsData = new DataSet(this.groups);
  itemsData = new DataSet(this.items);

  ngAfterViewInit() {
    this.initTimeline();
  }

  ngOnChanges(){
    this.initTimeline();
  }

  private initTimeline() {
    if (!this.timelineContainer) return;

    const container = this.timelineContainer.nativeElement;

    this.groupsData = new DataSet(this.groups);
    this.itemsData = new DataSet(this.items);

    const options:TimelineOptions = {
      start: new Date(),
      end: addWeeks(new Date(), 2),
      editable: true,
      zoomable: true,
      stack: true,
      orientation: 'top',
      timeAxis: { scale: 'hour', step: 1 },
      margin: { item: 10 },
      onMove:  (item, callback) => {
        const prefix = (item.id + "").split("_")[0];
        console.log(prefix)
        this.itemsData.forEach(event => {
          const prefixItem= (event.id+"").split("_")[0]
          if(event.id !== item.id &&  prefixItem === prefix){
            console.log(event)
            event.start = item.start;
            event.end = item.end;
          }
        });
        callback(item);
        this.timeline.setItems(this.itemsData);
      },
    };

    if (this.timeline) {
      this.timeline.destroy();
    }

    this.timeline = new Timeline(container, this.itemsData, this.groupsData, options);

  }
}
