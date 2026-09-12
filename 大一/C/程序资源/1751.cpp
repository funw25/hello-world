//假设使用一个整型二维数组classroom保存学校一栋教学楼中教室的座位数，
//数组大小为m*n，其中m表示楼层，n表示每层的教室数，
//如classroom[0][0]中存储第一层第一个教室的座位数，
//找出该栋楼中有最多座位数的教室及其该教室是第几层第几个教室
//（注意楼层从1开始，教室编号从1开始）。

#include"stdio.h"
int main()
{

    int c[2][3];
    for(int i=0;i<2;i++){
        for(int j=0;j<3;j++){
            scanf("%d",&c[i][j]);
        }
    }
    int max=0,t;
    int maxFloor = 0;
    int maxRoom = 0;
    for(int i=0;i<2;i++){
        for(int j=0;j<3;j++){
            if(c[i][j]>max){
                max = c[i][j];
                maxFloor = i + 1;
                maxRoom = j + 1;
            }
        }
    }
    printf("max=%d, floor=%d,no=%d.",max,maxFloor,maxRoom);
    return 0;
}
